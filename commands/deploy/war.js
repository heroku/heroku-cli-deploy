'use strict';

const cli = require('heroku-cli-util');
const co = require('co');
const path = require('path');
const fs = require('fs');
const helpers = require('../../lib/helpers')

module.exports = function(topic, command) {
  return {
    topic: topic,
    command: command,
    flags: [
        { name: 'war', char: 'w', hasValue: true },
        { name: 'jdk', char: 'j', hasValue: true },
        { name: 'includes', char: 'i', hasValue: true },
        { name: 'webapp-runner', hasValue: true },
        { name: 'buildpacks', hasValue: true },
        { name: 'build-version', hasValue: true }],
    variableArgs: true,
    usage: `${topic}:${command} WAR`,
    description: 'Deploys a WAR file to Heroku.',
    needsApp: true,
    needsAuth: true,
    run: cli.command(co.wrap(war))
  };
};

function* war(context, heroku) {
  return withWarFile(context, function(warFile) {
    if (!warFile.endsWith('.war'))
      return cli.exit(1, 'War file must have a .war extension');

    if (!fs.existsSync(warFile))
      return cli.exit(1, 'War file not found: ' + warFile);

    if (fs.statSync(warFile).size > helpers.maxFileSize())
      return cli.exit(1, `War file must not exceed ${helpers.maxFileSizeMegabytes()} MB`);

    return deployWar(warFile, context)
  });
}

function deployWar(file, context) {
  cli.log(`Uploading ${ path.basename(file) }`)
  return helpers.deploy(context, [
    `-Dheroku.warFile=${file}`,
    '-jar',
    helpers.herokuDeployJar()
  ]);
}

function withWarFile(context, callback) {
  if (context.args.length > 0) {
    return callback(context.args[0]);
  } else if (context.flags.war) {
    return callback(context.flags.war);
  } else {
    return cli.exit(1, "No .war specified.\nSpecify which war to use with --war <war file name>");
  }
}
