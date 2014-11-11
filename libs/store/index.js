/**
 * Simple app state storage
 */

var util = require('./util');
var path = require('path');

module.exports = {

  /**
   * Init storage
   * @param  {String} dir App data path
   * @param {Object} state Initial app state data
   */
  init: function (dir, state) {
    this.dir = dir;
    this.stateFile = path.join(dir, 'state.json');

    util
      .ensureDir(dir)
      .ensureFile(this.stateFile, state);

    this.state = util.read(this.stateFile);
    return this;
  },

  getState : function () {
    return this.state;
  },

  setState : function (state) {
    this.state = state;
    util.write(this.stateFile, this.state);
  }

}
