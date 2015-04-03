/**
 * Load app menu for the current platform
 */

var config = require('../config');
var BrowserWindow = require('browser-window');
var Menu = require('menu');

var appMenuTemplate = require('./' + process.platform);

var menu = Menu.buildFromTemplate(appMenuTemplate);

module.exports = menu;
