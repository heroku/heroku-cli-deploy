'use strict';

const cli = require('heroku-cli-util');
const co = require('co');
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
    run: cli.command(co.wrap(jar))
  };
};

function* jar(context, heroku) {
  var file = getWarFilename(context)

  validate(!file.endsWith('.war') && !file.endsWith('.jar'),
           'JAR file must have a .jar or .war extension')

  validate(!fs.existsSync(file),
           'JAR file not found: ' + file)

  validate(fs.statSync(file).size > helpers.maxFileSize(),
           `JAR file must not exceed ${helpers.maxFileSize()} MB`)

  let status = yield deployWar(warFile, context)
}

function deployJar(file, context) {
  console.log('Uploading ' + path.basename(file))
  return helpers.deploy(context, [
    `-Dheroku.jarFile=${file}`,
    `-Dheroku.jarOpts=${context.flags.options.gsub('$','\$')}`,
    `-cp`, helpers.herokuDeployJar()
  ]);
}

function getJarFilename(context) {
  if (context.args.length > 0) {
    return path.join(process.cwd(), context.args[0])
  } else if (context.flags.jar) {
    return path.join(process.cwd(), context.flags.jar)
  } else {
    cli.error("No .jar specified.\nSpecify which war to use with --jar <jar file name>");
    process.exit(1)
  }
}

function validate(condition, message) {
  if (condition) {
    cli.error(message)
    process.exit(1)
  }
}
