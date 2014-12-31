/**
 * Simple app state storage
 */

var util = require('./util');
var path = require('path');


/**
 * Simple data wrapper with
 * modifying and accessing methods
 */
var collection = function (name) {

  var _name = name;
  var _data = [];

  return {

    get name() {
      return _name;
    },

    get all() {
      return _data;
    },

    get count() {
      return _data.length;
    },

    find : function (queryFunc) {
      return _data.filter(queryFunc);
    },

    findOne : function (queryFunc) {
      // TO DO: implement find method
      // return _data.find(queryFunc);
    },

    clean : function () {
      _data = [];
    },

    /**
     * Add item or items to the collection
     */
    add : function (items) {
      if(typeof items == 'undefined') return;

      if(Array.isArray(items)) {
        _data = _data.concat(items);
      } else {
        _data.push(items);
      }
    }
  };

};

module.exports = {

  /**
   * Init storage
   * @param  {String} dir App data path
   * @param {Object} state Initial app state data
   */
  init: function (dir, state) {
    this.dir = dir;
    this.stateFile = path.join(dir, 'state.json');
    this._collections = {};

    util
      .ensureDir(dir)
      .ensureFile(this.stateFile, state);

    this.state = util.read(this.stateFile, true);
    return this;
  },

  getState : function () {
    return this.state;
  },

  setState : function (state) {
    this.state = state;
    util.write(this.stateFile, this.state);
  },

  /**
   * Create simple collection or
   * return collection if exists
   */
  addCollection : function (name) {
    // If exists return it
    if(this._collections.hasOwnProperty(name)) {
      return this._collections[name];
    }
    // Or create new one
    this._collections[name] = collection(name);
    return this._collections[name];
  },

  /**
   * Return previously created collection or undefined
   */
  getCollection : function (name) {
    // If exists return it
    if(this._collections.hasOwnProperty(name)) {
      return this._collections[name];
    }
    return undefined;
  }

};
