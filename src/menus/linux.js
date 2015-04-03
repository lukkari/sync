/**
 * Linux menu
 */

var config = require('../config');
var BrowserWindow = require('browser-window');
var app = require('app');

module.exports = [
  {
    label: '&File',
    submenu: [
      {
        label: 'Quit',
        accelerator: 'Control+Q',
        click : function () { app.quit(); }
      }
    ]
  },

  {
    label: '&Edit',
    submenu: [
      { label: '&Undo', command: 'core:undo', accelerator: 'Control+Z' },
      { label: '&Redo', command: 'core:redo', accelerator: 'Control+Y' },

      { type: 'separator' },

      { label: '&Cut', command: 'core:cut', accelerator: 'Control+X' },
      { label: 'C&opy', command: 'core:copy', accelerator: 'Control+C' },
      { label: '&Paste', command: 'core:paste', accelerator: 'Control+V' },
      { label: 'Select &All', command: 'core:select-all', accelerator: 'Control+A' }
    ]
  },

  {
    label: '&View',
    submenu: [
      {
        label: '&Reload',
        accelerator: 'Control+R',
        click: function() { BrowserWindow.getFocusedWindow().reloadIgnoringCache(); }
      }
    ]
  },

  {
    label: '&Help',
    submenu: [
      { label: 'About ' + config.appTitle, command: 'application:about' }
    ]
  }
];
