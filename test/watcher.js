var watcher = require('../libs/watcher');
var fs = require('fs');
var path = require('path');

var assert = require('assert');

describe('Watcher', function () {
  var dir = path.normalize('tmp');
  var file = path.join(dir, 'one');

  before(function () {
    fs.mkdirSync(dir);
    fs.writeFileSync(file, '1');
  });

  it('should trigger file change', function (done) {
    watcher.watch(dir, function (e, filename) {
      if(filename == 'one') {
        done();
        watcher.unwatch();
      }
    });

    setTimeout(function () {
      fs.appendFileSync(path.join(dir, 'one'), '2')
    }, 200);
  });

  after(function () {
    fs.unlinkSync(file);
    fs.rmdirSync(dir);
  });
});
