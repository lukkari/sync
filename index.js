/**
 * App main file
 */

var config = require('./config');

// Atom libs
var app = require('app');
var BrowserWindow = require('browser-window');
var Tray = require('tray');
var Menu = require('menu');
var ipc = require('ipc');

// App libs
var store = require('./libs/store/');
var watcher = require('./libs/watcher');
var csv = require('csv-parse');
var fs = require('fs');

// Report crashes to the server.
require('crash-reporter').start(config.crashReporter);

/**
 * Current app state variables
 */
var state = null;
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var win = null;
var appIcon = null;

app.on('window-all-closed', function () {
  // Don't close. Minimize to tray
  //if(process.platform != 'darwin') app.quit();
});

app.on('quit', function () {
  watcher.unwatch();
});

app.on('ready', function () {

  // Init storage
  store = store.init(app.getDataPath(), config.stateObj);
  state = store.getState();

  // If watching dir is not specified, try to set it up
  if(!store.validDir(state.watchDir)) openWindow();
  else startWatching(state.watchDir);

  ipc.on('watchdir', function (e, dir) {
    state.watchDir = dir;
    store.setState(state);
    startWatching(dir);
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

  win.loadUrl(config.baseFile);

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

var startWatching = function (dir) {

  watcher.watch(dir,
    {
      types : ['csv'],
      event : 'change',
      hidden : false
    },
    function (err, file) {
      if(err) return console.log(err);

      fs.readFile(file, function (err, data) {
        if(err) return console.log(err);
        csv(data, { delimiter: ',' }, function (err, output) {
          if(err) return console.log(err);
          console.log(output);
        });
      });
    }
  );
}
