/**
 * Server synchronization
 */

var io = require('socket.io-client');
var request = require('request');
var store = require('../libs/store');
var schedule = require('./schedule');
var shell = require('shell');

/**
 * Set up socket connection with schedule server
 */
function setUpSockets() {
  var state = store.getState();
  var manage = io.connect(state.baseUrl + 'manage',
                          { query : 'token=' + state.appToken });

  manage
    .on('connect', function () {
      console.log('Connected');
    })
    .on('connect_failed', function (reason) {
      console.error('Failed: ', reason);
    });

  return manage;
}

/**
 * POST schedule data to the server
 * @param {Array} data schedule entries
 */
function postSchedule(data, cb) {
  var state = store.getState();

  var postUrl = state.baseUrl + 'api/entry';
  request.post({
      url : postUrl,
      body : data,
      json : true
    },
    cb
  );
}

/**
 * Triggered on sync-file event from the page
 * @param {Event}  e
 * @param {Object} config new app state
 */
function onSyncFile(e, config, cb) {
  console.log(config);
  cb = cb || function () {};
  // Update state
  var state = store.getState();
  state.baseUrl = config.baseUrl;
  state.appToken = config.appToken;

  store.setState(state);
  var socket = setUpSockets();

  schedule.processFile(config.file, config.filter, function (err, data) {
    if(err) {
      return cb(new Error('Failed to sync file'));
    }

    console.log('successfull sync');

    // Process data to the server
    socket.emit('new_version', config.filter, function () {
      console.log('Push entries');
      postSchedule(data, function (err, res, body) {
        if(err) {
          console.log(err);
          return cb(err);
        }

        // When successfully updated on the server
        if(config.isFileToBeRemoved) {
          shell.moveItemToTrash(config.file);
        }

        if(config.isQuitApp) {
          console.log(typeof app);
        }

        console.log(body);
        return cb();
      });
    });
  });
}

module.exports = function (app) {
  return {
    onSyncFile : onSyncFile
  };
};
