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

  it('should create collection', function () {
    var name = 'test';
    var coll = store.addCollection(name);
    assert.equal(name, coll.name);
  });

  it('should add items to collection', function () {
    var name = 'items';
    var coll = store.addCollection(name);
    var items = ['one', 'two'];
    coll.add(items);
    assert.deepEqual(items, coll.all);
  });

  it('should find item in collection', function () {
    // Use collection from previous test
    var name = 'items';
    var coll = store.getCollection(name);
    assert.equal('one', coll.find(function (item) { return item == 'one'; }));
  });

  it('should find item in multiple collections', function () {
    var names = ['col1', 'col2'];
    var queryFun = function (item) { return item === 1; };
    names.forEach(function (name, index) {
      var col = store.addCollection(name);
      col.add([index + 1, 2*(index + 1)]);
    });
    assert.deepEqual([1], store.findInCollections(names, queryFun));
  });

  it('should get collection name by query', function () {
    // Use previously added collections
    var names = ['col1', 'col2'];
    var queryFun = function (item) { return item === 1; };
    assert.equal('col1', store.getCollectionName(names, queryFun));
  });

  after(function () {
    fs.unlinkSync(stateFile);
    fs.rmdirSync(dir);
  });
});
