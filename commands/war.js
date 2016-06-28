'use strict';

const cli = require('heroku-cli-util');
const co = require('co');
const path = require('path');
const fs = require('fs');
const helpers = require('../lib/helpers')

module.exports = function(topic) {
  return {
    topic: topic,
    command: 'war',
    flags: [
        { name: 'war', char: 'w', hasValue: true },
        { name: 'jdk', char: 'j', hasValue: true },
        { name: 'includes', char: 'i', hasValue: true },
        { name: 'webapp-runner', hasValue: true}],
    variableArgs: true,
    description: 'Deploys a WAR file to Heroku.',
    needsApp: true,
    needsAuth: true,
    run: cli.command(co.wrap(war))
  };
};

function* war(context, heroku) {
  var warFile = getWarFilename(context)

  validate(!warFile.endsWith('.war'),
           'War file must have a .war extension')

  validate(!fs.existsSync(warFile),
           'War file not found: ' + warFile)

  validate(fs.statSync(warFile).size > helpers.maxFileSize(),
           `War file must not exceed ${helpers.maxFileSize()} MB`)

  let status = yield deployWar(warFile, context)
}

function deployWar(file, context) {
  console.log('Uploading ' + path.basename(file))
  return helpers.deploy(context, [
    `-Dheroku.warFile=${file}`,
    '-jar',
    helpers.herokuDeployJar()
  ]);
}

function getWarFilename(context) {
  if (context.args.length > 0) {
    return path.join(process.cwd(), context.args[0])
  } else if (context.flags.war) {
    return path.join(process.cwd(), context.flags.war)
  } else {
    cli.error("No .war specified.\nSpecify which war to use with --war <war file name>");
    process.exit(1)
  }
}

function validate(condition, message) {
  if (condition) {
    cli.error(message)
    process.exit(1)
  }
}
