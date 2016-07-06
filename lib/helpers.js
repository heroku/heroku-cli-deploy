'use strict'

const cli = require('heroku-cli-util')
const path = require('path');
const child = require('child_process');

function maxFileSizeMegabytes() {
  return 300;
}

function maxFileSize() {
  return maxFileSizeMegabytes() * 1024 * 1024;
}

function herokuDeployJar() {
  return process.env.HEROKU_DEPLOY_JAR_PATH ?
    process.env.HEROKU_DEPLOY_JAR_PATH :
    path.join(__dirname, 'heroku-deploy-complete.jar')
}

function deploy(context, args) {
  return new Promise((resolve, reject) => {
    if (context.flags.webappRunner)
      args.unshift("-Dheroku.webappRunnerVersion=" + context.flags.webappRunner)

    if (context.flags.jdk)
      args.unshift("-Dheroku.jdkVersion=" + context.flags.jdk)

    if (context.flags.includes)
      args.unshift("-Dheroku.includes=" + context.flags.includes)

    let allArgs = [
      `-Dheroku.appName=${context.app}`,
      '-Xmx1g'
    ].concat(args)

    cli.hush(`java ${allArgs.join(' ')}`)
    let spawned = child.spawn('java', allArgs, {stdio: 'pipe'})
      .on('exit', (code, signal) => {
        if (signal || code) reject(signal || code);
        else resolve();
      });
    spawned.stdout.on('data', (chunk) => {
      cli.console.writeLog(chunk.toString());
    });
    spawned.stdout.on('end', () => {});
  });
}

module.exports = {
  deploy,
  herokuDeployJar,
  maxFileSize,
  maxFileSizeMegabytes
}
