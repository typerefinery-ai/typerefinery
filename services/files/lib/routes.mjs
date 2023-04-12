import debug from 'debug';
import fs from 'fs-extra';
import path from 'path';
import origFs from 'fs';
import koaRouter from 'koa-router';
import bodyParser from 'koa-bodyparser';
import { Readable } from 'stream';

import Tools from './tools.mjs';
import fileMap from './fileMap.mjs'; const FilePath = fileMap.filePath;
import FileManager from './fileManager.mjs';

const d = debug('fm:routes');
const dm = debug('fm:routes:meta');
const dopts = debug('fm:routes:options');
const du = debug('fm:routes:upload');
const df = debug('fm:routes:folder');
const dl = debug('fm:routes:delete');
const da = debug('fm:routes:archive');


let router = new koaRouter();

let currentUploads = {}; // fname: {size:Int, currentSize:Int}
let currentUploadsLast = 0;

router.get('/', async (ctx, next) => {
    d('redirecting to /files');

    ctx.redirect((ctx.mountPath || '') + '/files');
});

router.get('/files', async (ctx, next) => {
    d('getting files ui');

    ctx.status = 200;
    ctx.type = 'text/html; charset=utf-8';
    let content = await fs.readFile(path.join(NODEFILEMANAGER.BASEPATH, './lib/views/files.html'));

    content = content.toString();
    // hard replace, do not dynamically with a delay.
    content = content.replaceAll('%version%', NODEFILEMANAGER.VERSION);
    content = content.replaceAll('%appname%', NODEFILEMANAGER.APPNAME);


    ctx.body = content;
});

router.get('/api/*event', async (ctx, next) => {
    dm('register');

    ctx.status = 200;
    ctx.set('Content-Type', 'text/event-stream');
    ctx.set('Cache-Control', 'no-cache');
    ctx.set('Connection', 'keep-alive');

    let s = new Readable();
    s._read = () => { };
    ctx.body = s;

    let lastUpdate = 0;
    setInterval(() => {
        if (lastUpdate === currentUploadsLast) return;

        //dm('sending for', Object.keys(currentUploads).length, 'files');

        lastUpdate = currentUploadsLast;

        const refreshRate = 2000;
        const id = lastUpdate;
        const data = JSON.stringify({ files: currentUploads });

        s.push(`retry: ${refreshRate}\nid:${id}\ndata: ${data}\n\n`);
    }, 1000);
});

router.put('/api/options', async (ctx, next) => {
    var type = ctx.query.type;
    var p = ctx.request.fPath;

    dopts(type);

    if (!type) {
        ctx.status = 400;
        ctx.body = 'Missing arg type';
    } else if (type === 'TOGGLE_SHOW_ALL_FILES') {
        ctx.body = await FileManager.toggleShowAllFiles(null);
    } else if (type === 'GET_SHOW_ALL_FILES') {
        ctx.body = await FileManager.showAllFiles();
    } else if (type === 'SHOW_ALL_FILES_ON') {
        ctx.body = await FileManager.toggleShowAllFiles(true);
    } else if (type === 'SHOW_ALL_FILES_OFF') {
        ctx.body = await FileManager.toggleShowAllFiles(false);
    } else if (type === 'GET_FILE_FILTER') {
        ctx.body = { file: NODEFILEMANAGER.FILEFILTER, mime: NODEFILEMANAGER.MIMEFILTER };
    } else if (type === 'GET_FILE_MAXSIZE') {
        ctx.body = NODEFILEMANAGER.MAXSIZE;
    } else {
        ctx.status = 400;
        ctx.body = 'Arg type error!';
    }
});

router.get('/api/(.*)', Tools.loadRealPath, Tools.checkPathExists, async (ctx, next) => {
    d(ctx.request.fPath);

    var p = ctx.request.fPath;
    var stats = await fs.stat(p);
    if (stats.isDirectory()) {
        ctx.body = await FileManager.list(p);
    } else {
        ctx.set('x-transfer-length', stats.size);
        ctx.set('Content-Length', stats.size);
        ctx.set('Content-disposition', 'attachment; filename=' + path.basename(p));

        ctx.body = origFs.createReadStream(p);
    }
});

router.del('/api/(.*)', Tools.loadRealPath, Tools.checkPathExists, async (ctx, next) => {
    dl(ctx.request.fPath);

    var p = ctx.request.fPath;
    var fp = ctx.request.relfPath;
    await FileManager.remove(p);

    if (fp in currentUploads) {
        delete currentUploads[fp];
        currentUploadsLast = Date.now();
    }
    ctx.body = 'Deleting successful!';
});

router.put(
    '/api/(.*)',
    Tools.loadRealPath,
    Tools.checkPathExists,
    bodyParser(),
    async (ctx, next) => {
        var type = ctx.query.type;
        var p = ctx.request.fPath;

        d(type + ': ' + p);

        if (!type) {
            ctx.status = 400;
            ctx.body = 'Missing arg type';
        } else if (type === 'MOVE') {
            var src = ctx.request.body.src;
            if (!src || !(src instanceof Array)) return (ctx.status = 400);
            var src = src.map(function (relPath) {
                return FilePath(relPath, true);
            });
            await FileManager.move(src, p);
            ctx.body = 'Moving successful!';
        } else if (type === 'RENAME') {
            var target = ctx.request.body.target;
            if (!target) return (ctx.status = 400);
            await FileManager.rename(p, FilePath(target, true));
            ctx.body = 'Renaming successful!';
        } else {
            ctx.status = 400;
            ctx.body = 'Arg type error!';
        }
    }
);

router.post(
    '/api/(.*)',
    Tools.loadRealPath,
    Tools.checkPathNotExists,
    //bodyParser(),
    async (ctx, next) => {

        var type = ctx.query.type;
        var p = ctx.request.fPath;
        if (!type) {
            ctx.status = 400;
            ctx.body = 'Missing arg type!';
        } else if (type === 'CREATE_FOLDER') {
            df('Create: ' + p);

            await FileManager.mkdirs(p);
            ctx.body = 'Creating folder successful!';
        } else if (type === 'UPLOAD_FILE') {
            du('Starting: ' + p);
            console.log('Starting: ' + p);


            //let fTmp = path.join(os.tmpdir(), Date.now().toString());    somehow, the files are gone on OSX
            let fTmpUploading = p + '.uploading';
            let fTmpDone = p + '.done';
            let fTmpError = p + '.error';
            let chunksSum = 0;

            let requestNameUploading = ctx.request.relfPath + '.uploading';
            let requestNameError = ctx.request.relfPath + '.error';
            let appendix;
            let overwrite = ctx.query.overwrite;

            console.log('overwrite: ' + overwrite);

            currentUploads[requestNameUploading] = { size: ctx.headers['content-length'], currentSize: 0 };
            currentUploadsLast = Date.now();

            await new Promise(async (resolve, reject) => {
                [fTmpUploading, appendix] = await FileManager.existsSave(fTmpUploading);
                requestNameUploading += appendix;

                ctx.req.pipe(fs.createWriteStream(fTmpUploading));
                ctx.req.on('end', async () => {
                    du('All bytes received: ' + p);
                    // in case, target exists, or any other error, this file is marked as done.
                    [fTmpDone, appendix] = await FileManager.renameSave(fTmpUploading, fTmpDone);

                    // if overwrite is set, and the file exists delete it
                    if (overwrite) {
                      await FileManager.remove(p);
                    }

                    [p, appendix] = await FileManager.renameSave(fTmpDone, p);

                    { // remove the finished file from the uploading meta
                        delete currentUploads[requestNameUploading];
                        currentUploadsLast = Date.now();
                    }

                    du('Finished: ' + p);
                    resolve();
                });
                ctx.req.on('data', (chunk) => {
                    chunksSum += chunk.length;

                    // check if it did not get deleteted while uploading
                    if (currentUploads[requestNameUploading]) {
                        // update progress
                        currentUploads[requestNameUploading].currentSize = chunksSum;
                        currentUploadsLast = Date.now(); // signal change
                    }
                    else {
                        ctx.req.destroy(new Error('File deleted'));
                        return;
                    }


                    //! ...max filesize check !
                    //?  check headers beforehand ('content-size' / upload-ajax: file.size)
                    if (chunksSum > NODEFILEMANAGER.MAXSIZE) {
                        // closes connection and triggers ctx.req.on('error', ...) for processing
                        ctx.req.destroy(new Error('File too large'));
                        return;
                    }
                });
                ctx.req.on('error', async err => {
                    du('Error: ' + p);
                    [fTmpError, appendix] = await FileManager.renameSave(fTmpUploading, fTmpError);

                    // check if it did not get deleteted while uploading
                    if (currentUploads[requestNameUploading]) {
                        // change uploading meta to error file name
                        requestNameError += appendix;
                        currentUploads[requestNameError] = currentUploads[requestNameUploading];
                        delete currentUploads[requestNameUploading];
                        currentUploadsLast = Date.now();
                    }

                    reject(err);
                });
            });

            ctx.status = 200;
            ctx.body = `Uploaded ${ctx.params[0]}`;
        } else if (type === 'CREATE_ARCHIVE') {
            da('creating ' + p);

            await bodyParser()(ctx, _ => { });
            var src = ctx.request.body.src;
            if (!src) return (ctx.status = 400);
            src = src.map(function (file) {
                return FilePath(file, true);
            });
            var archive = p;
            await FileManager.archive(
                src,
                archive,
                NODEFILEMANAGER.DATA_ROOT,
                !!ctx.request.body.embedDirs
            );
            da('created ' + p);
            ctx.body = 'Creating archive successful!';
        } else {
            ctx.status = 400;
            ctx.body = 'Arg type error!';
        }
    }
);

export default router.middleware();
