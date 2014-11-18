/**
 * Watcher lib
 */
var fs = require('fs');
var path = require('path');

function init() {
  conn = null;

  return {

    /**
     * Watch file changes in directory
     *
     * watch(dir, [options], cb)
     *   - dir String
     *   - options Object
     *       * types Array (of file extensions)
     *       * event String
     *       * hidden Boolean (include hidden files)
     *   - cb Function
     *
     * The callback is passed three arguments (err, path, filename),
     * where path is full path to file
     *
     */
    watch : function () {
      var dir = arguments[0];
      var options = {};
      var cb;

      if(arguments.length === 3) {
        options = arguments[1];
        cb = arguments[2];
      } else if(arguments.length === 2) {
        cb = arguments[1];
      }

      conn = fs.watch(dir, function (e, filename) {
        var filetype;

        if(e != options.event) return;
        if(!options.hidden && filename.substr(0, 1) == '.') return;

        filetype = path.extname(filename).slice(1);
        if(options.types.length && options.types.indexOf(filetype) === -1) return;

        return cb(null, path.join(dir, filename), filename);
      });
    },

    unwatch : function () {
      if(conn) conn.close();
    }

  }
}

module.exports = init();
