/**
 * Transfer component data from .mxt to json
 */

var fs = require('fs');
var path = require('path');

var componentDataPath = './componentdata.tmp';

fs.readFile(componentDataPath, { encoding : 'utf-8' }, function (err, data) {
  if(err) return console.log(err);

  var lines = data.split('\n');

  var categories = ['groups', 'teachers', 'rooms', 'other'];
  var container = {};

  lines.forEach(function (line) {
    if(!line.length) return;

    var data = line.split('=')[1];
    var items = data.split(';');

    container[items[0]] = {
      name : items[1],
      category : categories[items[2] - 1]
    };
  });

  fs.writeFile('components.json', JSON.stringify(container, null, '\t'), function (err) {
    if(err) console.log(err);
  });

  console.log('Files are processing');

});
