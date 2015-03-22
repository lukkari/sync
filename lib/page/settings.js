/**
 * Settings page controller
 */

var storage = require('./storage');
var ipc = require('ipc');
var xhr = require('./xhr');

module.exports = function (document, window) {

  /**
   * Settings
   */
  var baseUrl = document.querySelector('#baseUrl');
  var appToken = document.querySelector('#appToken');
  var isFileToBeRemoved = document.querySelector('#isFileToBeRemoved');
  var isQuitApp = document.querySelector('#isQuitApp');

  baseUrl.addEventListener('change', function () {
   var isUpdated = storage.set('baseUrl', baseUrl.value);

   if(isUpdated) {
     // Test url correctness
     xhr.isValidServer(baseUrl.value, function (isValid) {
       storage.set('isValidServer', isValid);

       if(isValid) {
         baseUrl.classList.remove('wrong');
         ipc.send('update_baseUrl', baseUrl.value);
         return;
       }

       // Show error
       baseUrl.classList.add('wrong');
     });
   }

  }, false);

  appToken.addEventListener('change', function () {
   storage.set('appToken', appToken.value);
   ipc.send('update_token', appToken.value);
  }, false);

  isFileToBeRemoved.addEventListener('change', function () {
   storage.set('isFileToBeRemoved', isFileToBeRemoved.checked);
  }, false);

  isQuitApp.addEventListener('change', function () {
   storage.set('isQuitApp', isQuitApp.checked);
  }, false);

  // Restore saved state
  baseUrl.value = storage.get('baseUrl') || '';
  if(!storage.get('isValidServer', 'boolean')) {
    baseUrl.classList.add('wrong');
  }

  appToken.value = storage.get('appToken') || '';
  isFileToBeRemoved.checked = storage.get('isFileToBeRemoved', 'boolean');
  isQuitApp.checked = storage.get('isQuitApp', 'boolean');


  /**
   * Settings modal functionality
   */
  var openSettingsBtn = document.querySelector('#openSettingsBtn');
  var closeSettingsBtn = document.querySelector('#closeSettingsBtn');
  var settingsOverlay = document.querySelector('#overlay');
  var settingsNode = document.querySelector('#settings');

  function toggleSettings() {
    var style = settingsNode.style;
    var state = style.display == 'none' ? 'block' : 'none';

    style.display = state;
    settingsOverlay.style.display = state;
  }

  function closeSettings() {
    var baseUrl = storage.get('baseUrl');
    var appToken = storage.get('appToken');
    var isValidServer = storage.get('isValidServer', 'boolean');

    if(!baseUrl || !appToken) {
      return alert('Specify server location and application token first');
    }

    if(!isValidServer) {
      return alert('Server url should be valid');
    }

    toggleSettings();
  }

  openSettingsBtn.addEventListener('click', toggleSettings, false);
  closeSettingsBtn.addEventListener('click', closeSettings, false);
  settingsOverlay.addEventListener('click', closeSettings, false);

  /**
   * Filters
   */
  var filtersSelect = document.querySelector('#filters');
  storage.set('filter', filtersSelect.value);

  filtersSelect.addEventListener('change', function () {
    storage.set('filter', filtersSelect.value);
  }, false);

  ipc.on('update_filters', function (filters) {
    // Remove previous filters
    while (filtersSelect.firstChild) {
      filtersSelect.removeChild(filtersSelect.firstChild);
    }

    // Populate select box
    filters.forEach(function (filter) {
      var opt = document.createElement('option');
      opt.value = filter._id;
      opt.label = filter.name;
      if(storage.get('filter') === filter._id) opt.selected = true;
      filtersSelect.appendChild(opt);
    });

    storage.set('filter', filtersSelect.value);
  });

  return {
    toggleSettings : toggleSettings
  };
};
