/**
 * Manipulate with schedule data
 */

var path = require('path');
var fs = require('fs');
var csv = require('csv-parse');
var help = require('./help');
var store = require('../libs/store');
var migrate = require('../libs/migrate')(store);

/**
 * Process single file
 * @param {String}   filePath full file path
 * @param {String}   filter building id
 * @param {Function} cb
 */
function processFile(filePath, filter, cb) {
  if(!filePath) return cb(new Error('No file path'));

  var ext = path.extname(filePath);

  if(ext === '.csv') {
    // Schedule file
    parseCsvFromFile(filePath, function (err, data) {
      if(err) return cb(err);

      handleScheduleData(data, filter, cb);
    });
  } else if(ext == '.mxt') {
    // Mimosa text file
    return cb(new Error('Not implemented'));
  } else {
    return cb(new Error('Wrong file extenstion'));
  }

}

/**
 * Parse .csv file (file with schedule)
 * @param {String}   dir    full file path
 * @param {Function} cb
 */
function parseCsvFromFile(dir, cb) {
  console.log('Parse csv from: ', dir);

  var content = help.decode(help.rawRead(dir), 'ISO-8859-1');
  csv(content, { delimiter: ',' }, cb);
}

/**
 * Process schedule data into correct format
 * @param {Array}    output data parsed by csv
 * @param {String}   filter building id
 * @param {Function} cb
 */
function handleScheduleData(output, filter, cb) {
  var data = migrate
    .fromArray(output)
    .map(migrate.processOldItem);

  console.log('Before: ', data.length);

  data = help
    .unique(data)
    .map(function (entry) { entry.filter = filter; return entry; });

  console.log('Entries: ', data.length);
  console.log('Filter:', filter);

  return cb(null, data);
}


module.exports = {
  processFile : processFile
};
