/**
 * Utilities for storage
 */

var fs = require('fs');
var iconv = require('iconv-lite');

module.exports = {

  exists : function (dir) {
    return fs.existsSync(dir);
  },

  mkdir : function (dir) {
    return fs.mkdirSync(dir);
  },

  write : function (dir, data, forceCreate) {
    var flag = forceCreate ? 'w+' : 'w';
    data = data || [];
    return fs.writeFileSync(dir, this.prepare(data), {
      encoding: 'utf-8',
      flag: flag
    });
  },

  read : function (dir, isJSON) {
    return (
      isJSON
        ? this.restore(fs.readFileSync(dir))
        : fs.readFileSync(dir, { encoding : 'utf-8' })
    );
  },

  ensureDir : function (dir) {
    if(!this.exists(dir)) this.mkdir(dir);
    return this;
  },

  ensureFile : function (dir, data) {
    if(!this.exists(dir)) this.write(dir, data, true);
    return this;
  },

  prepare : function (data) {
    return JSON.stringify(data);
  },

  restore : function (data) {
    return JSON.parse(data);
  },

  decode : function (data, from) {
    return iconv.decode(data, from);
  },

  rawRead : function (dir) {
    return fs.readFileSync(dir);
  }

};
