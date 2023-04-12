import fs from 'fs-extra';
import fileMap from './fileMap.mjs';
import debug from 'debug';

const de = debug('fm:error');
const di = debug('fm:info');
const dt = debug('fm:traffic');

const FilePath = fileMap.filePath;


export default {
  realIp: async (ctx, next) => {
    ctx.req.ip = ctx.headers['x-forwarded-for'] || ctx.ip;
    await next();
  },

  handleError: async (ctx, next) => {
    try {
      await next();
    } catch (err) {

      ctx.status = err.status || 500;
      ctx.body = err.message || err.code;
      de(err.code, err.stack);

      // Not needed. We handled it here. Do not pass it to parent.
      //if (ctx.app)
      //  ctx.app.emit('error', err, ctx);
    }
  },

  handleAppError: async (err, ctx) => {
    // user disconneted / aborted download
    if (["ECONNRESET", "EPIPE"].indexOf(err.code) !== -1) {
      debug('fm:traffic:canceled')(ctx.method, ctx.status, ctx.url);
      return;
    }

    console.error(err.message, err.stack);
  },

  loadRealPath: async (ctx, next) => {
    // router url format must be /api/(.*)
    ctx.request.fPath = FilePath(ctx.params[0]);
    ctx.request.relfPath = '/' + encodeURI(ctx.params[0]);
    di('Request path: ' + ctx.request.fPath);
    await next();
  },

  checkPathExists: async (ctx, next) => {
    // Must after loadRealPath
    if (!(await fs.stat(ctx.request.fPath).catch(_ => false))) {
      ctx.status = 404;
      ctx.body = 'Configured directory does not exist!';
      de('Configured directory (option `--directory`) does not exist: ', ctx.request.fPath);
    }
    else {
      await next();
    }
  },

  checkPathNotExists: async (ctx, next) => {
    // check if overwrite
    de('overwrite: ', ctx.query.overwrite);
    var overwrite = ctx.query.overwrite;
    if (overwrite && overwrite === 'true') {
      await next();
      return;
    }
    // Must after loadRealPath
    if (await fs.stat(ctx.request.fPath).catch(_ => false)) {
      ctx.status = 400;
      ctx.body = 'Path exists!';
    }
    else {
      await next();
    }
  },


  logTraffic: async (ctx, next) => {
    const start = Date.now();

    await next();

    dt(ctx.method, ctx.status, ctx.url);

    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
  }

};
