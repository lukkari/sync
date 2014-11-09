var fs = require('fs');
var path = require('path');

var watcher = function (dir, output) {
  fs.watch(path.join(dir), output);

  console.log('Start watching ' + dir);
};

module.exports = watcher;
