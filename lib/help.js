/**
 * App helpers
 */

var fs = require('fs');
var iconv = require('iconv-lite');

var help = module.exports = {

  exists : function (dir) {
    return fs.existsSync(dir);
  },

  mkdir : function (dir) {
    return fs.mkdirSync(dir);
  },

  write : function (dir, data, forceCreate) {
    var flag = forceCreate ? 'w+' : 'w';
    data = data || [];
    return fs.writeFileSync(dir, help.prepare(data), {
      encoding: 'utf-8',
      flag: flag
    });
  },

  read : function (dir, isJSON) {
    return (
      isJSON
        ? help.restore(fs.readFileSync(dir))
        : fs.readFileSync(dir, { encoding : 'utf-8' })
    );
  },

  ensureDir : function (dir) {
    if(!help.exists(dir)) help.mkdir(dir);
    return this;
  },

  ensureFile : function (dir, data) {
    if(!help.exists(dir)) help.write(dir, data, true);
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
  },

  /**
   * Return array with unique items
   */
  unique : function (a) {
    var out = [];
    var seen = {};

    for(var i = 0; i < a.length; i += 1) {
      var key = JSON.stringify(a[i]);
      var item = a[i];
      if(!seen.hasOwnProperty(key)) {
        seen[key] = item;
        out.push(item);
      }
    }

    return out;
  },

  /**
   * Wrap function to output execution time
   */
  withTime : function (f) {
    return function () {
      var start = new Date().getTime();
      var res = f.apply(null, arguments);
      var end = new Date().getTime();
      console.log('Time spent: ', (end - start) / 1000 + 's');
      return res;
    };
  }

};
