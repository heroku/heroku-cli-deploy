'use strict';

const cli = require('heroku-cli-util');
const co = require('co');
const child = require('child_process');

module.exports = function(topic) {
  return {
    topic: topic,
    command: 'jar',
    flags: [{ name: 'file' }],
    description: 'Deploys a JAR file to Heroku.',
    needsApp: false,
    needsAuth: true,
    run: cli.command(co.wrap(jar))
  };
};

function* jar(context, heroku) {
  cli.error("Error: Not implemented");
}
