/**
 * App main file
 */

var config = require('./config');

// Atom libs
var app = require('app');
var BrowserWindow = require('browser-window');
var ipc = require('ipc');
var Menu = require('menu');

// App libs
var store = require('./lib/store');
var sync = require('./lib/sync')(app);
var menu = require('./menus/');

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

  Menu.setApplicationMenu(menu);

  openWindow();

  // Triggered when user chose a file to upload
  ipc.on('sync-file', function (e, conf) {
    sync.onSyncFile(e, conf, sendToPage);
  });

  // When user change base url
  ipc.on('update_baseUrl', function () {
    var isChanged = sync.onBaseUrl.apply(null, arguments);
    if(isChanged) loadCategoriesAndNotify();
  });

  // When user changed app token
  ipc.on('update_token', function () {
    var isChanged = sync.onToken.apply(null, arguments);
    // No need to update categories as they have public access now
    // if(isChanged) loadCategoriesAndNotify();
  });

  function loadCategoriesAndNotify() {
    sync.loadCategories(sendToPage);
  }

  loadCategoriesAndNotify();
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

/**
 * Sends message to the browser page
 * @param {String} name
 * @param {String} msg
 */
function sendToPage(name, msg) {
  if(!win) return;

  if(!win.webContents.isLoading()) {
    // When window is loaded
    win.webContents.send(name, msg);
    return;
  }

  // Otherwise finish to load
  win.webContents.on('did-finish-load', function () {
    win.webContents.send(name, msg);
  });
}
