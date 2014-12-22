/**
 * Test store lib
 */
var store = require('../libs/store');
var fs = require('fs');
var path = require('path');

var assert = require('assert');

describe('store lib', function () {
  var dir = path.normalize('tmp');
  var stateFile = path.join(dir, 'state.json');

  store = store.init(dir);

  it('should create directory and app state file on init', function () {
    assert.equal(true, fs.existsSync(dir));
    assert.equal(true, fs.existsSync(stateFile));
  });

  it('initial state should equal to empty array', function () {
    var state = store.getState();
    assert.equal(0, state.length);
  });

  it('test setState function and file content', function () {
    var data;
    store.setState([2]);
    data = JSON.parse(fs.readFileSync(stateFile));

    assert.equal(2, store.getState()[0]);
    assert.equal(2, data[0]);
  });

  after(function () {
    fs.unlinkSync(stateFile);
    fs.rmdirSync(dir);
  });
});
