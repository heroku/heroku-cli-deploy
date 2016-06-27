'use strict';

const cli = require('heroku-cli-util');
const co = require('co');
const path = require('path');
const helpers = require('../lib/helpers')

module.exports = function(topic) {
  return {
    topic: topic,
    command: 'war',
    flags: [{ name: 'war', char: 'w' }],
    variableArgs: true,
    description: 'Deploys a WAR file to Heroku.',
    needsApp: true,
    needsAuth: true,
    run: cli.command(co.wrap(war))
  };
};

function* war(context, heroku) {
  var warFile = context.args.length > 0 ?
      path.join(process.cwd(), context.args[0]) :
      path.join(process.cwd(), context.flags.war)

  // TODO validate the file

  let status = yield deployWar(warFile, context.app)
}

function deployWar(warFile, appName) {
  let args = [
    `-Dheroku.warFile=${warFile}`,
  ];

  console.log('Uploading ' + path.basename(warFile))
  return helpers.deploy(args, appName);
}
