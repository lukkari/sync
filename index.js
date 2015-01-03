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
var util = require('./libs/util');
var store = require('./libs/store');
var csv = require('csv-parse');
var fs = require('fs');
var migrate = require('./libs/migrate')(store);
var io = require('socket.io-client');
var request = require('request');
var chokidar = require('chokidar');
var watcher;

// Report crashes to the server.
require('crash-reporter').start(config.crashReporter);

/**
 * Current app state variables
 */
var state = null;
var categoryNames = ['groups', 'teachers', 'rooms'];
var socket;
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var win = null;
var appIcon = null;

app.on('window-all-closed', function () {
  // Don't close. Minimize to tray
  //if(process.platform != 'darwin') app.quit();
});

app.on('quit', function () {
  if(watcher) watcher.close();
});

app.on('ready', function () {

  // Init storage
  store = store.init(app.getDataPath(), config.stateObj);
  state = store.getState();

  // Init sockets
  socket = setUpSockets();

  // If watching dir is not specified, try to set it up
  if(!util.exists(state.watchDir)) openWindow();
  else startWatching(state.watchDir);

  ipc.on('watchdir', function (e, dir) {
    state.watchDir = dir;
    store.setState(state);
    startWatching(dir);
  });

  ipc.on('mimosafile', function (e, file) {
    var components = migrate
      .componentsFromMimosa(file)
      .map(migrate.processComponent)
      .filter(function (item) { return item.category != 'other'; });

    components.forEach(function (component) {
       var action = 'add_' + component.category;
       socket.emit(action, component.data);
    });
  });

  // Listen to all categories
  categoryNames.forEach(function (name) {
    var action = name + '_added';
    socket.on(action, function (item) {
      // Add new item to category collection
      store.getCollection(name).add(item);
    });
  });

  // Load categories
  var apiUrl = config.baseUrl + '/api/';
  categoryNames.forEach(function (cat) {
    // Form category api url
    var catUrl = apiUrl + cat;
    request(catUrl, function (err, response, body) {
      if(err) console.log(err);

      if (!err && response.statusCode == 200) {
        // TO DO: handle bad data (not json)
        var cats = JSON.parse(body);
        var collection = store.addCollection(cat);
        collection.add(cats);
        console.log(collection.name);
      }
    });
  });

  // Init tray icon
  appIcon = new Tray(config.trayIcon);
  var contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
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
  if(!!process.env.DEBUG) win.openDevTools();

  win.loadUrl(config.baseFile);

  win.webContents.on('did-finish-load', function () {
    win.webContents.send('state', state);
  });

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

  // TO DO: Include ignored files: hidden, ...
  var watcher = chokidar.watch(dir);

  watcher
    .on('add', function (path) { console.log(path, 'was added'); })
    .on('change', function (path) {
      console.log(path, 'was changed');
      fs.readFile(path, function (err, data) {
        if(err) return console.log(err);

        csv(data, { delimiter: ',' }, function (err, output) {
          if(err) return console.log(err);

          var data = migrate.fromArray(output);
          data = data.map(migrate.processOldItem);
          console.log('Entries: ', data.length);
          // Process data to the server
          socket.emit('new_version');
          socket.on('start_update', function (res) {
            var v = res.version || 0;
            data.forEach(function (item) {
              item.version = v;
              socket.emit('add_entry', item);
            });
          });
        });
      });
    })
    .on('ready', function () { console.log('start watching'); })
    .on('error', function (err) { console.log(err); });
};

var trayMenuTemplate = [
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
];

function setUpSockets() {
  var manage = io.connect('http://localhost:3000/manage', { query : 'token=Roman' });

  manage
    .on('connect', function () {
      console.log('Connected');
    })
    .on('connect_failed', function (reason) {
      console.error('Failed: ', reason);
    });

  return manage;
}
