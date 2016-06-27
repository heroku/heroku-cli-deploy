'use strict'

const cli = require('heroku-cli-util')
const path = require('path');
const child = require('child_process');

function deploy(args, appName) {
  return new Promise((resolve, reject) => {
    let defaultArgs = [
      `-Dheroku.appName=${appName}`,
      '-Xmx1g',
      '-jar',
      path.join(__dirname, 'heroku-deploy-complete.jar')
    ];

    let allArgs = args.concat(defaultArgs)

    child.spawn('java', allArgs, { stdio: 'inherit' })
      .on('exit', (code, signal) => {
        if (signal || code) reject(signal || code);
        else resolve();
      });
  });
}

module.exports = {
  deploy
}
