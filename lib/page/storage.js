/**
 * Storage (save data to localStorage)
 */

var config = {};

var storage = {
  add : function (key, value, stringify) {
    var isChanged = config.hasOwnProperty(key) && (config[key] === value);

    if(isChanged) {
      config[key] = value;

      value = stringify ? JSON.stringify(value) : value;
      localStorage.setItem(key, value);
    }
  },

  get : function (key, type) {
    var val;

    if(!config.hasOwnProperty(key)) {
      val = localStorage.getItem(key);
      switch(type) {
        case 'boolean':
          val = val === 'true' ? true : false;
          break;
        case 'object':
          val = JSON.parse(val);
          break;
      }
      config[key] = val;
    }

    return config[key];
  },

  setFile : function (file) {
    config.file = file;
  },

  getFile : function () {
    return config.file;
  },

  formConfig : function () {
    return extend(config, {});
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
