/**
 * Darwin (OSX) menu
 */

var config = require('../config');
var BrowserWindow = require('browser-window');
var app = require('app');

module.exports = [
  {
    label: config.appTitle,
    submenu: [
      { label: 'About ' + config.appTitle, selector: 'orderFrontStandardAboutPanel:' },

      { type: 'separator' },

      { label: 'Services', submenu: [] },

      { type: 'separator' },

      { label: 'Hide ' + config.appTitle, accelerator: 'Command+H', selector: 'hide:' },
      { label: 'Hide Others', accelerator: 'Command+Shift+H', selector: 'hideOtherApplications:' },
      { label: 'Show All', selector: 'unhideAllApplications:' },

      { type: 'separator' },

      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click : function () { app.quit(); }
      }
    ]
  },

  {
    label: 'Edit',
    submenu: [
      { label: 'Undo', selector: 'undo:', accelerator: 'Command+Z' },
      { label: 'Redo', selector: 'redo:', accelerator: 'Shift+Command+Z' },

      { type: 'separator' },

      { label: 'Cut', selector: 'cut:', accelerator: 'Command+X' },
      { label: 'Copy', selector: 'copy:', accelerator: 'Command+C' },
      { label: 'Paste', selector: 'paste:', accelerator: 'Command+V' },
      { label: 'Select All', selector: 'selectAll:', accelerator: 'Command+A' }
    ]
  },

  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'Command+R',
        click: function() { BrowserWindow.getFocusedWindow().reloadIgnoringCache(); }
      }
    ]
  },

  {
    label: 'Window',
    submenu: [
      { label: 'Minimize', accelerator: 'Command+M', selector: 'performMiniaturize:' },
      { label: 'Close', accelerator: 'Command+W', selector: 'performClose:' },

      { type: 'separator' },

      { label: 'Bring All to Front', selector: 'arrangeInFront:' }
    ]
  },

  { label: 'Help', submenu: [] }
];
