import path from 'path';


export default {
   filePath: function filePath(relPath, decodeURI) {
    if (decodeURI) relPath = decodeURIComponent(relPath);
    if (relPath.indexOf('..') >= 0){
      const e = new Error('Do Not Contain .. in relPath!');
      e.status = 400;
      throw e;
    }
    else {
      return path.join(NODEFILEMANAGER.DATA_ROOT, relPath);
    }
  }
};