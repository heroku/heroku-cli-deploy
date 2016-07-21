'use strict'
/* globals cli */

global.cli = require('heroku-cli-util')
global.commands = require('../index').commands
cli.raiseErrors = true
cli.color.enabled = false

if (process.env.HEROKU_API_TOKEN != undefined) {
  global.apiKey = process.env.HEROKU_API_TOKEN;
} else if (process.env.HEROKU_API_KEY != undefined) {
  global.apiKey = process.env.HEROKU_API_KEY;
} else {
  throw new Error("HEROKU_API_TOKEN is not set!");
}
