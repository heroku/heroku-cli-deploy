'use strict'

const cli = require('heroku-cli-util')
const path = require('path');
const child = require('child_process');
const fs = require('fs');

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
    if (context.flags['webapp-runner'])
      args.unshift(`-Dheroku.webappRunnerVersion=${context.flags['webapp-runner']}`)

    if (context.flags.jdk)
      args.unshift(`-Dheroku.jdkVersion=${context.flags.jdk}`)

    if (context.flags.includes)
      args.unshift(`-Dheroku.includes=${context.flags.includes}`)

    if (context.flags['build-version'])
      args.unshift(`-Dheroku.buildVersion=${context.flags['build-version']}`)

    if (context.flags['buildpacks'])
      args.unshift(`-Dheroku.buildpacks=${context.flags['buildpacks']}`)

    let allArgs = [
      `-Dheroku.appName=${context.app}`,
      '-Xmx1g'
    ].concat(args)

    cli.hush(`java ${allArgs.join(' ')}`)
    let spawned = child.spawn('java', allArgs, {stdio: 'pipe'})
      .on('exit', (code, signal) => {
        if (signal || code) {
          reject(
            `There was a problem deploying to ${cli.color.white.bold(context.app)}.
            Make sure you have permission to deploy by running: ${cli.color.magenta('heroku apps:info -a ' + context.app)}`);
        } else {
          resolve();
        }
      });
    spawned.stdout.on('data', (chunk) => {
      cli.console.writeLog(chunk.toString());
    });
    spawned.stderr.on('data', (chunk) => {
      cli.console.writeLog(chunk.toString());
    });
  });
}

function runWebappRunner(context, warFile, args) {
  return new Promise((resolve, reject) => {
    _downloadWebappRunner(context.flags['webapp-runner'] || '8.0.33.4', function(webappRunnerJarPath) {
      let allArgs = [
        '-Xmx1g',
      ].concat(args).concat([
        '-jar',
        webappRunnerJarPath,
        warFile
      ])

      cli.hush(`java ${allArgs.join(' ')}`)
      let spawned = child.spawn('java', allArgs, {stdio: 'pipe'})
        .on('exit', (code, signal) => {
          if (signal || code) reject(signal || code);
          else resolve();
        });
      spawned.stdout.on('data', (chunk) => {
        cli.console.writeLog(chunk.toString());
      });
      spawned.stderr.on('data', (chunk) => {
        cli.console.writeLog(chunk.toString());
      });
      spawned.stdout.on('end', () => {});
    })
  })
}

function _downloadWebappRunner(version, callback) {
  let url = `https://central.maven.org/maven2/com/github/jsimone/webapp-runner/${version}/webapp-runner-${version}.jar`
  let file = path.join('target', `webapp-runner-${version}.jar`)
  if (fs.existsSync(file)) {
    callback(file);
  } else {
    if (!fs.existsSync(path.dirname(file))) fs.mkdirSync(path.dirname(file))
    cli.log(`Downloading ${file}...`)
    let fileStream = fs.createWriteStream(file)
    cli.got.stream(url).pipe(fileStream)
    fileStream.on('finish', function() {
      fileStream.close(() =>
        callback(file)
      )
    });
  }
}

module.exports = {
  deploy,
  runWebappRunner,
  herokuDeployJar,
  maxFileSize,
  maxFileSizeMegabytes
}
