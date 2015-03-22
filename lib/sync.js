/**
 * Server synchronization
 */

var config = require('../config');
var io = require('socket.io-client');
var request = require('request');
var store = require('./store');
var schedule = require('./schedule');
var shell = require('shell');
var help = require('./help');
var path = require('path');

// List of categories available
var categoryNames = ['groups', 'teachers', 'rooms', 'filters'];

/**
 * Set up socket connection with schedule server
 */
function setUpSockets() {
  var state = store.getState();
  var manage = io.connect(help.joinUrl(state.baseUrl, 'manage'),
                          { query : 'token=' + state.appToken });

  // manage
  //   .on('connect', function () {
  //     console.log('Connected');
  //   })
  //   .on('disconnect', function () {
  //     console.log('disconnected');
  //   })
  //   .on('connect_failed', function (reason) {
  //     console.error('Failed: ', reason);
  //   });

  return manage;
}

/**
 * POST schedule data to the server
 * @param {Array} data schedule entries
 */
function postSchedule(data, cb) {
  var state = store.getState();

  var postUrl = help.joinUrl(state.baseUrl, 'api/app/entry');
  request.post({
      url : postUrl,
      body : data,
      json : true,
      timeout : 5000,
      headers : {
        'App-Token' : state.appToken
      }
    },
    cb
  );
}

/**
 * Triggered on sync-file event from the page
 * @param {Event}  e
 * @param {Object} conf new app state
 */
function onSyncFile(e, conf, send) {
  send = send || function () {};
  // Update state
  // TODO: should be updated already though
  var state = store.getState();
  state.baseUrl = conf.baseUrl;
  state.appToken = conf.appToken;

  store.setState(state);

  var socket = setUpSockets();

  var isProcessed = false;

  socket
  .on('connected', function () {
    if(isProcessed) return;

    isProcessed = true;
    continueSync();
  })
  .on('disconnected', function () {
    isProcessed = true;
    send('sync-error', 'Cannot connect to the server');
  });

  // Called once when socket connection is established
  function continueSync() {

    schedule.processFile(conf.file, conf.filter, function (err, data) {
      if(err) {
        return send('sync-error', 'Failed to sync file');
      }

      // Prevent from multiple fires
      var isTriggered = false;
      var failTimeout = setTimeout(function () {
        isTriggered = true;
        return send('sync-error', 'Cannot connect to the server');
      }, 2000);

      // Process data to the server
      socket.emit('new_version', conf.filter, function () {
        console.log('Push entries');
        clearTimeout(failTimeout);
        if(isTriggered) return;

        postSchedule(data, function (err, res, body) {
          if(err) {
            console.log(err);
            return send('sync-error', err);
          }

          // When successfully updated on the server
          if(conf.isFileToBeRemoved) {
            console.log('moveItemToTrash');
            // shell.moveItemToTrash(conf.file);
          }

          if(conf.isQuitApp) {
            console.log(typeof app);
          }

          console.log('Server body', body);

          var msg = [
            'File',
            path.basename(config.file),
            'was successfully synced.'
          ].join(' ');

          return send('sync-success', msg);
        });
      });
    });

  }
}

/**
 * Load all categories
 * @param {Function} send send message to the page callback
 */
function loadCategories(send) {
  var state = store.getState();

  if(!state.baseUrl) return false;

  var apiUrl = config.formAPIUrl(state.baseUrl);

  console.log('API:', apiUrl);

  categoryNames.forEach(function (cat) {
    var catUrl = help.joinUrl(apiUrl, cat);

    request(catUrl, function (err, res, body) {
      if(err) console.log(err);

      if(!err && res.statusCode == 200) {
        var list = JSON.parse(body);
        var collection = store.addCollection(cat);
        collection.clean();
        collection.add(list);
        console.log('Load:', collection.name);

        if(collection.name == 'filters') {
          return send('update_filters', collection.all);
        }
      }
    });
  });
}

/**
 * Triggered when baseUrl was changed on the page
 * @param {Event} e
 * @param {String} url server location (baseUrl)
 */
function onBaseUrl(e, url) {
  var state = store.getState();

  if(state.baseUrl !== url) {
    // Update only when changed
    state.baseUrl = url;
    store.setState(state);

    return true;
  }

  return false;
}

/**
 * Triggered when appToken was changed on the page
 * @param {Event} e
 * @param {String} token application token
 */
function onToken(e, token) {
  var state = store.getState();

  if(state.appToken !== token) {
    // Update only when changed
    state.appToken = token;
    store.setState(state);

    return true;
  }

  return false;
}

module.exports = function (app) {
  return {
    onSyncFile : onSyncFile,
    loadCategories : loadCategories,
    onToken : onToken,
    onBaseUrl : onBaseUrl
  };
};
