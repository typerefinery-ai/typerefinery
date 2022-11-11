exports.default = async function (context) {
  const fsExtra = require("fs-extra")
  // NOTE: ONLY FOR WINDOWS
  const localPath =
    "C:/Users/" +
    require("os").userInfo().username +
    "/AppData/Roaming/TypeRefinery/Local Storage"
  fsExtra.emptyDirSync(localPath)
}
