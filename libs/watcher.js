/**
 * Watcher lib
 */
var fs = require('fs');
var path = require('path');

var Watcher = function () {
  this.conn = null;
};

Watcher.prototype.watch = function (dir, output) {
  this.conn = fs.watch(dir, output);
  console.log('Start watching ' + dir);
};

Watcher.prototype.unwatch = function () {
  if(!this.conn) return false;
  this.conn.close();
};

module.exports = new Watcher();
