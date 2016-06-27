var assert = require('chai').assert;
var compareSync = require('dir-compare').compareSync;
var path = require('path');
var fs = require('fs-extra');
var os = require('os');

var war = require('../commands/war')('TEST');

describe('war', function() {

  describe('happy path', function() {
    it('deploys successfully', function() {
      this.fixture = fixture('basic');
      war.run({
        debug: true,
        cwd: this.fixture.cwd,
        flags: { image: 'myapp.war' }
      });
      // todo how to test the command output?
    });
  });

});
