var fs = require('fs');
var path = require('path');

var watcher = function (dir) {
  fs.watch(path.join(dir), function (e, filename) {
    console.log('Event: ' + e);
    console.log('Filename:' + filename);
  });

  console.log('Start watching ' + dir);
};

module.exports = watcher;
