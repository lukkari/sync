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
var path = require('path');
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
var categoryNames = ['groups', 'teachers', 'rooms', 'filters'];
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
  store.init(app.getDataPath(), config.stateObj);
  state = store.getState();

  // Init sockets
  socket = setUpSockets();

  // If watching dir is not specified, try to set it up
  // if(!util.exists(state.watchDir)) openWindow();
  // else startWatching(state.watchDir);
  openWindow();

  ipc.on('watchdir', function (e, dir) {
    state.watchDir = dir;
    store.setState(state);
    startWatching(dir);
  });

  ipc.on('schedulefile', function (e, params) {
    var file = params.file;
    var filter = params.filter;

    if(path.extname(file) !== '.csv') return;
    if(!filter.length) return;

    parseCsvFromFile(file, filter);
  });

  ipc.on('mimosafile', function (e, data) {
    var filter = data.filter;
    var file = data.file;

    // var { filter, file } = data;

    var components = migrate
      .componentsFromMimosa(file)
      .map(migrate.processComponent)
      .filter(function (item) { return item.category != 'other'; })
      .map(function (item) { item.data.filter = filter; return item; });

    components.forEach(function (component) {
       var action = 'add_' + component.category;
       socket.emit(action, component.data);
    });
  });

  // TODO: get baseUrl from user settings
  var apiUrl = config.baseUrl + '/api/';

  // Listen to all categories
  categoryNames.forEach(function (cat) {
    var action = cat + '_added';
    socket.on(action, function (item) {
      // Add new item to category collection
      store.getCollection(cat).add(item);
    });

    // Form category api url
    var catUrl = apiUrl + cat;
    request(catUrl, function (err, response, body) {
      if(err) console.log(err);

      if (!err && response.statusCode == 200) {
        // TODO: handle bad data (not json)
        var cats = JSON.parse(body);
        var collection = store.addCollection(cat);
        collection.add(cats);
        console.log('Load:', collection.name);
        if(collection.name == 'filters' && win) {
          win.webContents.send('update_filters', collection.all);
        }
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

    var col = store.getCollection('filters');
    // If no filters fetched return
    if(!col) return;
    win.webContents.send('update_filters', col.all);
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

  // TODO: Include ignored files: hidden, ...
  var watcher = chokidar.watch(dir);

  watcher
    .on('add', function (dir) { console.log(dir, 'was added'); })
    .on('change', parseCsvFromFile)
    .on('ready', function () { console.log('start watching'); })
    .on('error', function (err) { console.log(err); });
};

function parseCsvFromFile(dir, filter) {
  console.log('Parse csv from: ', dir);

  var content = util.decode(util.rawRead(dir), 'ISO-8859-1');
  csv(content, { delimiter: ',' }, function (err, output) {
    if(err) return console.log(err);
    handleScheduleData(output, filter);
  });
}

function handleScheduleData(output, filter) {
  var data = migrate
    .fromArray(output)
    .map(migrate.processOldItem);

  console.log('Before: ', data.length);

  data = util
    .unique(data)
    .map(function (entry) { entry.filter = filter; return entry; });

  console.log('Entries: ', data.length);
  console.log('Filter:', filter);
  // Process data to the server
  socket.emit('new_version', filter, function () {
    console.log('Push entries');
    // data.forEach(function (item) {
    //   socket.emit('add_entry', item);
    // });
    postSchedule(data);
    // socket.emit('add_entries', data);
  });
}

function postSchedule(data) {
  var postUrl = config.baseUrl + 'api/entry';
  request.post({
      url : postUrl,
      body : data,
      json : true
    }, function (err, res, body) {
      if(err) console.log(err);

      console.log(body);
    }
  );
}

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
  var manage = io.connect(config.baseUrl + 'manage', { query : 'token=Roman' });

  manage
    .on('connect', function () {
      console.log('Connected');
    })
    .on('connect_failed', function (reason) {
      console.error('Failed: ', reason);
    });

  return manage;
}
