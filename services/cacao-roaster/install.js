const { exec } = require('child_process');

exec('npm install', (err, stdout, stderr) => {
  if (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
  if (stderr) console.error(stderr);
  console.log(stdout);
});
