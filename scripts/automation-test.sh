echo "INSTALL: NODE"
nvm install v17.6.0
ls -latr
echo "INSTALL: PACKAGES"
npm install --unsafe-perm=true --allow-root
echo "RUN: PREVIEW"
npm run test:e2e:ci3
