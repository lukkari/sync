/**
 * Storage (save data to localStorage)
 */

var config = {};

var storage = {
  set : function (key, value, stringify) {
    var isChanged = config.hasOwnProperty(key) && (config[key] !== value);

    if(isChanged) {
      config[key] = value;

      value = stringify ? JSON.stringify(value) : value;
      localStorage.setItem(key, value);
    }
  },

  get : function (key, type) {
    var value;

    if(!config.hasOwnProperty(key)) {
      value = localStorage.getItem(key);
      switch(type) {
        case 'boolean':
          value = value === 'true' ? true : false;
          break;
        case 'object':
          value = JSON.parse(val);
          break;
      }

      config[key] = value;
    }

    return config[key];
  },

  setFile : function (file) {
    if(!file || !file.path) return;
    config.file = file.path;
  },

  getFile : function () {
    return config.file;
  },

  rmFile : function () {
    config.file = null;
  },

  formConfig : function () {
    return extend(config, { filter : '1' });
  }
};

module.exports = storage;

/**
 * Simple extend function for key-value pairs
 */
function extend(a, b) {
  var obj = {};

  Object.getOwnPropertyNames(a).forEach(function (prop) {
    obj[prop] = a[prop];
  });

  Object.getOwnPropertyNames(b).forEach(function (prop) {
    obj[prop] = b[prop];
  });

  return obj;
}
