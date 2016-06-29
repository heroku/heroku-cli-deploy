'use strict'

const cli = require('heroku-cli-util')
const path = require('path');
const child = require('child_process');

function error(message) {
  new Promise((resolve, reject) => {
    cli.error(message);
  });
}

function maxFileSize() {
  return 300 * 1024 * 1024;
}

function herokuDeployJar() {
  return process.env.HEROKU_DEPLOY_JAR_PATH ?
    process.env.HEROKU_DEPLOY_JAR_PATH :
    path.join(__dirname, 'heroku-deploy-complete.jar')
}

function deploy(context, args) {
  return new Promise((resolve, reject) => {
    if (context.flags.webappRunner)
      defaultArgs.unshift("-Dheroku.webappRunnerVersion=" + context.flags.webappRunner)

    if (context.flags.jdk)
      defaultArgs.unshift("-Dheroku.jdkVersion=" + context.flags.jdk)

    if (context.flags.includes)
      defaultArgs.unshift("-Dheroku.includes=" + context.flags.includes)

    let allArgs = [
      `-Dheroku.appName=${context.app}`,
      '-Xmx1g'
    ].concat(args)

    console.log(`java ${allArgs.join(' ')}`)
    child.spawn('java', allArgs, { stdio: 'inherit' })
      .on('exit', (code, signal) => {
        if (signal || code) reject(signal || code);
        else resolve();
      });
  });
}

module.exports = {
  error,
  deploy,
  herokuDeployJar,
  maxFileSize
}
