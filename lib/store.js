/**
 * Simple app state storage
 */

var help = require('./help');
var path = require('path');
var fs = require('fs');


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

      if(Array.isArray(items) && items.length) {
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

    help
      .ensureDir(dir)
      .ensureFile(this.stateFile, state);

    this.state = help.read(this.stateFile, true);
    return this;
  },

  /**
   * For testing purposes only!
   */
  destroy : function () {
    fs.unlinkSync(this.stateFile);
    fs.rmdirSync(this.dir);
    this.dir = null;
    this.stateFile = null;
    this._collections = null;
    this.state = null;
  },

  getState : function () {
    return this.state;
  },

  setState : function (state) {
    this.state = state;
    help.write(this.stateFile, this.state);
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
  },

  /**
   * Return multiple collections
   */
  getCollections : function (names) {
    var self = this;
    return names
      .map(function (name) { return self.getCollection(name); })
      .filter(function (item) { return typeof item !== 'undefined'; });
  },

  /**
   * Find data in multiple collections
   * @param {Array}    names    List of collection names
   * @param {Function} queryFun Query function
   */
  findInCollections : function (names, queryFun) {
    var cols = this.getCollections(names);
    var found = [];
    cols.forEach(function (col) {
      found = found.concat(col.find(queryFun));
    });
    return found;
  },

  /**
   * Get collection name where item is found
   */
  getCollectionName : function (names, queryFun) {
    var cols = this.getCollections(names);
    for(var i = 0; i < cols.length; i++) {
      var found = cols[i].find(queryFun);
      if(found && found.length) return cols[i].name;
    }
  },

  /**
   * The same as getCollectionName, but adds item
   *
   * Will be removed in the future!
   */
  getCollectionNameAndItem : function (names, queryFun) {
    var cols = this.getCollections(names);
    for(var i = 0; i < cols.length; i++) {
      var found = cols[i].find(queryFun);
      if(found && found.length) return {
          name : cols[i].name,
          item : found[0]
      };
    }
  }

};
