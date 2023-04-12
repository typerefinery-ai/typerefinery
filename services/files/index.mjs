/**
 * make the app mountable
 * 
 * @author Nabil Redmann 2018/2020/2022
 *
 * @example
 *    import fm from 'app-filemanager-esm';
 *    var appFm = fm('/uploadpath', 'zip|txt|mp4').app;
 *    mainApp.use(mount('/fm', appFm));
 **/

import Koa from 'koa';
import path from 'path';
import koaStatic from 'koa-static';
import Tools from './lib/tools';
import IndexRouter from './lib/routes';

let __dir_name = (typeof __dirname !== 'undefined') ? __dirname : '';
if (!__dir_name) {
  const im = import.meta; // fix node module -- fucks up babel
  __dir_name = path.resolve(path.dirname(decodeURI(new url.URL(im.url).pathname)));
}

const package_json = JSON.parse(await fs.readFile(__dir_name + '/../package.json', 'utf-8'));

// factory
const fm = function init(pathToWatch, filefilter, mimefilter, maxsize, appname) {

  global.NODEFILEMANAGER = {
    BASEPATH: __dirname,
    DATA_ROOT: pathToWatch || __dirname,
    FILEFILTER: filefilter || 'zip|tar.gz|7z|7zip|tar|gz|tgz|tbz|tar.bz2|tar.bz|txt|jpg|png|avi|mp4',
    MIMEFILTER: mimefilter || 'video/*|audio/*|image/*',
    MAXSIZE: (maxsize || 300) * 1024 * 1024,
    VERSION: package_json.version,
    APPNAME: appname || package_json.config.name
  };


  var app = new Koa();

  app.proxy = true;
  app.on('error', Tools.handleAppError);
  app.use(Tools.logTraffic);
  app.use(Tools.handelError);
  app.use(Tools.realIp);

  app.use(IndexRouter)

  app.use(koaStatic(path.join(__dir_name, './lib/public/')));

  fm.app = app;

  return fm;
}

fm.app = null; // init property

// export factory to be used in any Koa app
export default fm;