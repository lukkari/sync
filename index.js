/**
 * App main file
 */

var config = require('./config');

// Atom libs
var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var Tray = require('tray');
var Menu = require('menu');
var ipc = require('ipc');

// App libs
var store = require('./libs/store/');

// Report crashes to our server.
require('crash-reporter').start(config.crashReporter);

/**
 * Current app state variables
 */
var state = null;
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var win = null;
var appIcon = null;

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // Don't close. Minimize to tray
  //if(process.platform != 'darwin') app.quit();
});

// This method will be called when atom-shell has done everything
// initialization and ready for creating browser windows.
app.on('ready', function () {

  openWindow();

  // Init storage
  store = store.init(app.getDataPath(), config.stateObj);
  state = store.getState();

  ipc.on('watchdir', function (e, dir) {
    console.log(dir);
  });

  // Init tray icon
  appIcon = new Tray(config.trayIcon);
  var contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open',
      type: 'normal',
      click : openWindow
    },
    {
      label: 'Hide',
      type: 'normal',
      click : hideWindow
    },
    {
      label: 'Status',
      submenu: [
        {
          label: 'Enabled',
          type: 'radio'
        },
        {
          label: 'Disabled',
          type: 'radio'
        }
      ]
    },
    {
      label: 'Settings',
      type: 'normal',
      visible: false
    },
    {
      label: 'About',
      type: 'normal',
      visible: false
    },
    {
      type: 'separator'
    },
    {
      label: 'Quit',
      click: function () { app.quit(); }
    }
  ]);
  appIcon.setToolTip(app.getName());
  appIcon.setContextMenu(contextMenu);
});


var openWindow = function () {
  // Window is opened, ignore
  if(win) {
    win.show();
    return;
  }

  // Create the browser window.
  win = new BrowserWindow(config.browserWindow);

  // Open developer tools (ONLY FOR DEVELOPMENT)
  if(process.env.DEBUG == 'true') win.openDevTools();

  // and load the index.html of the app.
  win.loadUrl(config.baseFile);

  // Emitted when the window is closed.
  win.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
};

var hideWindow = function () {
  if(win) win.hide();
};
