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

cli.raiseErrors = true

describe('war', function() {
  this.timeout(0);

  beforeEach(() => cli.mockConsole());

  beforeEach(function() {
    return heroku.post('/apps').then((app) => {
      this.app = app;
      console.log(`Created ${ this.app.name }`);
    });
  });

  afterEach(function() {
    return heroku.delete(`/apps/${ this.app.name }`).then(() => {
      console.log(`Deleted ${ this.app.name }`);
    });
  });

  describe('happy path', function() {
    it('deploys successfully', function(done) {
      let config = {
        debug: true,
        auth: {password: apiKey},
        args: [ path.join('test', 'fixtures', 'sample-war.war') ],
        flags: {},
        app: this.app.name
      };

      war.run(config)
         .then(() => expect(cli.stdout, 'to contain', 'Uploading sample-war.war'))
         .then(() => expect(cli.stdout, 'to contain', 'Installing OpenJDK 1.8'))
         .then(() => expect(cli.stdout, 'to contain', 'deployed to Heroku'))
         .then(() => {
           cli.got(`https://${this.app.name}.herokuapp.com`).then(response => {
              expect(response.body, 'to contain', 'asdfasdfas');
              done();
           })
           .catch(error => {
             expect.fail(error.response.body)
             done();
           });
         });
    });
  });
});
