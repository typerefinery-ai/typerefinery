echo "INSTALL: NODE"
nvm install v17.6.0
ls -latr
echo "NPM: CONFIG"
npm set HOME /tmp/npm
npm config list
echo "INSTALL: PACKAGES"
rm -f package-lock.json
npm install --unsafe-perm=true --allow-root
echo "RUN: PREVIEW"
npm run test:e2e:ci3
# npm run posttest
