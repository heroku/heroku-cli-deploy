'use strict'
/* globals cli */

global.cli = require('heroku-cli-util')
global.commands = require('../index').commands
cli.raiseErrors = true
cli.color.enabled = false
