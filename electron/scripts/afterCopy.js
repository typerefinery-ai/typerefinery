import rebuild from "@electron/rebuild"

exports.default = async function (
  buildPath,
  electronVersion,
  platform,
  arch,
  callback
) {
  rebuild({ buildPath, electronVersion, arch })
    .then(() => callback())
    .catch((error) => callback(error))
}
