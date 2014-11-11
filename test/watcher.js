/**
 * Test watcher lib
 */
var watcher = require('../libs/watcher');
var fs = require('fs');
var path = require('path');

var assert = require('assert');

describe('watcher lib', function () {

  var dirs = ['tmp', 'tmp2'];
  var filenames = ['one', '.testing'];

  before(function () {
    dirs.forEach(function (dir) {
      fs.mkdirSync(dir);

      filenames.forEach(function (filename) {
        fs.writeFileSync(path.join(dir, filename), '');
      });
    });
  });

  it('should trigger file change', function (done) {
    var dir = dirs[0];
    var usefile = filenames[0];
    var usefilepath = path.join(dir, usefile);

    watcher.watch(dirs[0],
      {
        types : [],
        event : 'change',
        hidden : false
      },
      function (err, file, filename) {
        if(file == usefilepath && 'one' == filename) {
          done();
          watcher.unwatch();
        }
      }
    );

    setTimeout(function () {
      fs.appendFileSync(usefilepath, '2')
    }, 10);
  });

  it('should ignore hidden files', function (done) {
    var dir = dirs[1];

    watcher.watch(dir,
      {
        types : [],
        event : 'change',
        hidden : false
      },
      function (err, file, filename) {
        done();
      }
    );

    setTimeout(function () {
      fs.appendFileSync(path.join(dir, filenames[1]), 'two');
      fs.appendFileSync(path.join(dir, filenames[0]), 'two')
    }, 10);
  });

  after(function () {
    dirs.forEach(function (dir) {
      filenames.forEach(function (filename) {
        fs.unlinkSync(path.join(dir, filename));
      });

      fs.rmdirSync(dir);
    });
  });
});
