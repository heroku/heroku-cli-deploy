'use strict';

const cli = require('heroku-cli-util');
const path = require('path');
const fs = require('fs');
const helpers = require('../lib/helpers')

module.exports = function(topic) {
  return {
    topic: topic,
    command: 'jar',
    flags: [
        { name: 'jar', char: 'j', hasValue: true },
        { name: 'jdk', hasValue: true },
        { name: 'includes', char: 'i', hasValue: true },
        { name: 'options', char: 'o', hasValue: true}],
    variableArgs: true,
    description: 'Deploys an executable JAR file to Heroku.',
    needsApp: true,
    needsAuth: true,
    run: cli.command(jar)
  };
};

function* jar(context, heroku) {
  return withJarFile(context, function(file) {
    if (!(file.endsWith('.war') || file.endsWith('.jar')))
      helpers.error('JAR file must have a .jar or .war extension');

    if (!fs.existsSync(file))
      helpers.error(`JAR file not found: ${ file }`);

    if (fs.statSync(file).size > helpers.maxFileSize())
      helpers.error(`JAR file must not exceed ${helpers.maxFileSize()} MB`);

    return deployJar(file, context);
  });
}

function deployJar(file, context) {
  let opts = context.flags.options ?
              context.flags.options.replace('$','\$') : ''
  console.log('Uploading ' + path.basename(file))
  return helpers.deploy(context, [
    `-Dheroku.jarFile=${file}`,
    `-Dheroku.jarOpts="${opts}"`,
    `-cp`, helpers.herokuDeployJar(),
    'com.heroku.sdk.deploy.DeployJar'
  ]);
}

function withJarFile(context, callback) {
  if (context.args.length > 0) {
    return callback(path.join(process.cwd(), context.args[0]));
  } else if (context.flags.war) {
    return callback(path.join(process.cwd(), context.flags.jar));
  } else {
    return helpers.error("No .jar specified.\nSpecify which war to use with --jar <jar file name>");
  }
}
