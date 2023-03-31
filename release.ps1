Param(
  [string]$VERSION = "2023.3.31"
)

npm version ${VERSION}
git commit -s -a -m "chore: release v${VERSION}"
git tag -s -a v${VERSION} -m "v${VERSION}4"
git push && git push --tags
