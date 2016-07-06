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

const jar = commands.find((c) => c.topic === 'deploy' && c.command === 'jar')

describe('jar', function() {
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

  describe('when a jar file and valid app is specified', function() {
    it('deploys successfully', function() {
      let config = {
        debug: true,
        auth: {password: apiKey},
        args: [ path.join('test', 'fixtures', 'sample-jar.jar') ],
        flags: {},
        app: this.app.name
      };

      return jar.run(config)
         .then(() => expect(cli.stdout, 'to contain', 'Uploading sample-jar.jar'))
         .then(() => expect(cli.stdout, 'to contain', 'Installing OpenJDK 1.8'))
         .then(() => expect(cli.stdout, 'to contain', 'deployed to Heroku'))
         .then(() => cli.got(`https://${this.app.name}.herokuapp.com`)
            .then(response => expect(response.body, 'to contain', 'Hello from Java!')))
    });

    it('deploys successfully with .war extension', function() {
      let config = {
        debug: true,
        auth: {password: apiKey},
        args: [ path.join('test', 'fixtures', 'sample-war.war') ],
        flags: {},
        app: this.app.name
      };

      return jar.run(config)
         .then(() => expect(cli.stdout, 'to contain', 'Uploading sample-war.war'))
         .then(() => expect(cli.stdout, 'to contain', 'Installing OpenJDK 1.8'))
         .then(() => expect(cli.stdout, 'to contain', 'deployed to Heroku'))
    });

    it('deploys successfully with options', function() {
      let config = {
        debug: true,
        auth: {password: apiKey},
        args: [],
        flags: {
          jar: path.join('test', 'fixtures', 'sample-jar.jar'),
          jdk: "1.7"
        },
        app: this.app.name
      };

      return jar.run(config)
         .then(() => expect(cli.stdout, 'to contain', 'Uploading sample-jar.jar'))
         .then(() => expect(cli.stdout, 'to contain', 'Installing OpenJDK 1.7'))
         .then(() => expect(cli.stdout, 'to contain', 'deployed to Heroku'))
         .then(() => cli.got(`https://${this.app.name}.herokuapp.com`)
            .then(response => expect(response.body, 'to contain', 'Hello from Java!')))
    });

    it('validates the extension', function() {
      let config = {
        debug: true,
        auth: {password: apiKey},
        args: [ path.join('test', 'fixtures', 'invalid.txt') ],
        flags: {},
        app: this.app.name
      };

      expect(jar.run(config), "to be rejected with", /JAR file must have a \.jar or \.war extension/);
    });

    it("validates the file's existence", function() {
      let config = {
        debug: true,
        auth: {password: apiKey},
        args: [ path.join('test', 'fixtures', 'not-a-file.war') ],
        flags: {},
        app: this.app.name
      };

      expect(jar.run(config), "to be rejected with", /JAR file not found: /);
    });
  });

  describe('when a jar file is too big', function() {
    var fake = tmp.fileSync({postfix: '.jar'});
    var fileSize = 301;

    beforeEach(() => {
      child.execSync(`dd if=/dev/zero of=${fake.name} count=${fileSize} bs=1048576`, [], { stdio: 'pipe' });
    });

    afterEach(() => fake.removeCallback());

    it('validates the file size', function() {
      let config = {
        debug: true,
        auth: {password: apiKey},
        args: [ `${fake.name}` ],
        flags: {},
        app: this.app.name
      };

      expect(jar.run(config), "to be rejected with", /JAR file must not exceed 300 MB/);
    });
  });

  describe('when a jar file is big', function() {
    var fake = tmp.fileSync({postfix: '.jar'});
    var fileSize = 199;

    beforeEach(() => {
      console.log(fake.name)
      child.execSync(`dd if=/dev/zero of=${fake.name} count=${fileSize} bs=1048576`, [], { stdio: 'pipe' });
    });

    afterEach(() => fake.removeCallback());

    it('validates the file size', function() {
      let config = {
        debug: true,
        auth: {password: apiKey},
        args: [ `${fake.name}` ],
        flags: {},
        app: this.app.name
      };

      return jar.run(config)
         .then(() => expect(cli.stdout, 'to contain', 'Installing OpenJDK 1.8'))
         .then(() => expect(cli.stdout, 'to contain', 'deployed to Heroku'))
    });
  });
});
