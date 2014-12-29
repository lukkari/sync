/**
 * Migrate lib
 */

var fs = require('fs');
var path = require('path');
var util = require('./util');

var components = util.read(path.join(__dirname, '../data/components.json'));

var migrate = {

  /**
   * Convert data Array to object
   *
   * Input array's structure
   *
   * [ 'Subject',
   * 'Start Date',
   * 'Start Time',
   * 'End Date',
   * 'End Time',
   * 'Description',
   * 'Location' ]
   *
   */
  fromArray : function (data) {
    var keys = data[0];
    var out = [];
    var i;
    var d_start;
    var d_end;
    var el;
    var item;

    for(i = 1; i < data.length; i++) {
      el = data[i];
      d_start = Date.parse(el[1] + ' ' + el[2]);
      d_end = Date.parse(el[3] + ' ' + el[4]);
      item = {
        subject: el[0],
        location: el[6],
        description: el[5],
        date_start: (new Date(d_start)).toString(),
        date_end: (new Date(d_end)).toString()
      };
      out.push(item);
    }

    return out;
  },


  /**
   * Process entry item
   *
   *   - Find codes in each
   *   - Return new object with categories
   */
  processItem : function (item) {
    var entry = {
      date : {
        start : item.date_start,
        end : item.date_end
      }
    };

    entry.subject = item.subject.replace(/\[.*\]/, '').trim();

    var categories = ['groups', 'teachers', 'rooms'];
    categories.forEach(function (cat) {
      entry[cat] = [];
    });

    var codeString = item.description + ' ' + item.location;
    var codes = this.findCodes(codeString);

    codes.forEach(function (code) {
      // Use other components data in the future
      if(components.hasOwnProperty(code.code)) {
        entry[components[code.code].category].push(components[code.code].name);
      }
    });

    return entry;
  },


  /**
   * Process entry item as above, but for old items (only codes present)
   *
   *   - Find codes in each
   *   - Return new object with categories
   */
  processOldItem : function (item) {
    var entry = {
      date : {
        start : item.date_start,
        end : item.date_end
      }
    };

    entry.subject = item.subject.replace(/\[.*\]/, '').trim();

    var categories = ['groups', 'teachers', 'rooms'];
    categories.forEach(function (cat) {
      entry[cat] = [];
    });

    var codes = []
      .concat(item.description.split(/\s/))
      .concat(item.location.split(/\s/));

    codes.forEach(function (code) {
      if(components.hasOwnProperty(code)) {
        entry[components[code].category].push(components[code].name);
      }
    });

    return entry;
  },


  /**
   * Find codes and names
   *
   * Ex:
   *    Input 'Form-A:Group of Form-A'
   *    Output
   *    [
   *      {
   *        code : 'Form-A',
   *        name : 'Group of Form-A'
   *      }
   *    ]
   */
  findCodes : function (str) {
    var codes = str.trim().split(/\s(?=\S+?:)/);

    return codes.map(function (item) {
      var parts = item.split(':');
      return {
        code : parts[0],
        name : parts[1] || ''
      };
    });
  },


  /**
   * Get Componentdata from Mimosa text file
   */
  componentsFromMimosa : function (filepath) {
    var content = util.read(filepath);
    var components = content.match(/\[Componentdata\]([^[]+)/);

    if(components && components.length) return components[1].trim().split(/\s/);

    return null;
  }

};

module.exports = migrate;
