'use strict';

const assert = require('chai').assert;
const compareSync = require('dir-compare').compareSync;
const path = require('path');
const fs = require('fs-extra');
const child = require('child_process');
const os = require('os');
const Heroku = require('heroku-client');
const apiKey = process.env.HEROKU_API_TOKEN;
const heroku = new Heroku({ token: apiKey });
const expect = require('unexpected');
const tmp = require('tmp');

const commands = require('../index').commands
const war = commands.find((c) => c.topic === 'deploy' && c.command === 'war')

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
         .then(() => expect(cli.stdout, 'to contain', 'Installing OpenJDK 1.8'))
         .then(() => expect(cli.stdout, 'to contain', 'deployed to Heroku'))
         .then(() => cli.got(`https://${this.app.name}.herokuapp.com`)
            .then(response => expect(response.body, 'to contain', 'Hello World!')))
    });

    it('deploys successfully with options', function() {
      let config = {
        debug: true,
        auth: {password: apiKey},
        args: [],
        flags: {
          war: path.join('test', 'fixtures', 'sample-war.war'),
          jdk: "1.7"
        },
        app: this.app.name
      };

      return war.run(config)
         .then(() => expect(cli.stdout, 'to contain', 'Uploading sample-war.war'))
         .then(() => expect(cli.stdout, 'to contain', 'Installing OpenJDK 1.7'))
         .then(() => expect(cli.stdout, 'to contain', 'deployed to Heroku'))
         .then(() => cli.got(`https://${this.app.name}.herokuapp.com`)
            .then(response => expect(response.body, 'to contain', 'Hello World!')))
    });

    it('validates the extension', function() {
      let config = {
        debug: true,
        auth: {password: apiKey},
        args: [ path.join('test', 'fixtures', 'invalid.txt') ],
        flags: {},
        app: this.app.name
      };

      expect(war.run(config), "to be rejected with", /War file must have a \.war extension/);
    });

    it("validates the file's existence", function() {
      let config = {
        debug: true,
        auth: {password: apiKey},
        args: [ path.join('test', 'fixtures', 'not-a-file.war') ],
        flags: {},
        app: this.app.name
      };

      expect(war.run(config), "to be rejected with", /War file not found: /);
    });
  });

  describe('when a war file is too big', function() {
    var fakeWar = tmp.fileSync({postfix: '.war'});
    var fileSize = 301;

    beforeEach(() => {
      child.execSync(`dd if=/dev/zero of=${fakeWar.name} count=${fileSize} bs=1048576`, [], { stdio: 'pipe' });
    });

    afterEach(() => fakeWar.removeCallback());

    it('validates the file size', function() {
      let config = {
        debug: true,
        auth: {password: apiKey},
        args: [ `${fakeWar.name}` ],
        flags: {},
        app: this.app.name
      };

      expect(war.run(config), "to be rejected with", /War file must not exceed 300 MB/);
    });
  });

  describe('when a war file is big', function() {
    var fakeWar = tmp.fileSync({postfix: '.war'});
    var fileSize = 199;

    beforeEach(() => {
      child.execSync(`dd if=/dev/zero of=${fakeWar.name} count=${fileSize} bs=1048576`, [], { stdio: 'pipe' });
    });

    it('validates the file size', function() {
      let config = {
        debug: true,
        auth: {password: apiKey},
        args: [ `${fakeWar.name}` ],
        flags: {},
        app: this.app.name
      };

      return war.run(config)
         .then(() => expect(cli.stdout, 'to contain', 'Installing OpenJDK 1.8'))
         .then(() => expect(cli.stdout, 'to contain', 'deployed to Heroku'))
    });
  });
});
