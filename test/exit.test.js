'use strict';

const assert = require('chai').assert;
const compareSync = require('dir-compare').compareSync;
const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const Heroku = require('heroku-client');
const apiKey = process.env.HEROKU_API_TOKEN;
const heroku = new Heroku({ token: apiKey });
const cli = require('heroku-cli-util');
const expect = require('unexpected');

const commands = require('..').commands;
const war = commands.find((c) => c.command === 'war');

describe('exit', function () {
  beforeEach(() => cli.exit.mock())

  it('exits', function () {
    expect(war.run({}), "to be rejected")
  })
})
