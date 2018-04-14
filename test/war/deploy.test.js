'use strict';

const assert = require('chai').assert;
const compareSync = require('dir-compare').compareSync;
const path = require('path');
const fs = require('fs-extra');
const child = require('child_process');
const os = require('os');
const Heroku = require('heroku-client');
const heroku = new Heroku({ token: apiKey });
const expect = require('unexpected');
const tmp = require('tmp');

const war = commands.find((c) => c.topic === 'war' && c.command === 'deploy')

describe('war', function() {
  this.timeout(0);

  beforeEach(() => {
    cli.mockConsole();
    cli.exit.mock();
  });

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

  describe('when a war file and valid app is specified', function() {
    it('deploys successfully', function() {
      let config = {
        debug: true,
        auth: {password: apiKey},
        args: [ path.join('test', 'fixtures', 'sample-war.war') ],
        flags: {},
        app: this.app.name
      };

      return war.run(config)
         .then(() => expect(cli.stdout, 'to contain', 'Uploading sample-war.war'))
         .then(() => expect(cli.stdout, 'to contain', 'Installing JDK 1.8'))
         .then(() => expect(cli.stdout, 'to contain', 'deployed to Heroku'))
         .then(() => cli.got(`https://${this.app.name}.herokuapp.com`)
            .then(response => expect(response.body, 'to contain', 'Hello World!')))
    });
  });
});
