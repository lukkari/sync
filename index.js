/**
 * App main file
 */

var config = require('./config');

// Atom libs
var app = require('app');
var BrowserWindow = require('browser-window');
var ipc = require('ipc');

// App libs
var store = require('./libs/store');
var sync = require('./lib/sync')(app);

// Report crashes to the server.
require('crash-reporter').start(config.crashReporter);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var win = null;

app.on('before-quit', function () {
  // Save state
  console.log('quit');
});

app.on('window-all-closed', function () {
  // Don't quit on mac (app is hibernated)
  if(process.platform != 'darwin') app.quit();
});

app.on('ready', function () {
  // Init storage
  store.init(app.getDataPath(), config.stateObj);

  openWindow();

  // Triggered when user chose a file to upload
  ipc.on('sync-file', sync.onSyncFile);

  // Load categories
  sync.loadCategories(function (name, msg) {
    if(win) {
      win.webContents.send(name, msg);
    }
  });
});

// Fired when app was hibernated
app.on('activate-with-no-open-windows', function () {
  openWindow();
});

/**
 * Open main window
 */
function openWindow() {
  // Window is opened, ignore
  if(win) {
    win.show();
    return;
  }

  // Create the browser window
  win = new BrowserWindow(config.browserWindow);

  // Open developer tools (ONLY FOR DEVELOPMENT)
  if(!!process.env.DEBUG) win.openDevTools();

  win.loadUrl(config.baseFile);

  win.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  win.webContents.on('did-finish-load', function () {
    // Send current app state to the page
    win.webContents.send('state', store.getState());
  });
}
