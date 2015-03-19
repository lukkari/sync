/**
 * Settings page controller
 */

var storage = require('./storage');

module.exports = function (document, window) {

  var baseUrl = document.querySelector('#baseUrl');
  var appToken = document.querySelector('#appToken');
  var isFileToBeRemoved = document.querySelector('#isFileToBeRemoved');
  var isQuitApp = document.querySelector('#isQuitApp');

  baseUrl.addEventListener('change', function () {
   storage.set('baseUrl', baseUrl.value);
  }, false);

  appToken.addEventListener('change', function () {
   storage.set('appToken', appToken.value);
  }, false);

  isFileToBeRemoved.addEventListener('change', function () {
   storage.set('isFileToBeRemoved', isFileToBeRemoved.checked);
  }, false);

  isQuitApp.addEventListener('change', function () {
   storage.set('isQuitApp', isQuitApp.checked);
  }, false);

  // Restore saved state
  baseUrl.value = storage.get('baseUrl') || '';
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
    var baseUrl = localStorage.getItem('baseUrl');
    var appToken = localStorage.getItem('appToken');
    if(!baseUrl || !appToken) {
      return alert('Specify server location and application token first');
    }

    toggleSettings();
  }

  openSettingsBtn.addEventListener('click', toggleSettings, false);
  closeSettingsBtn.addEventListener('click', closeSettings, false);
  settingsOverlay.addEventListener('click', closeSettings, false);

  return {
    toggleSettings : toggleSettings
  };
};
