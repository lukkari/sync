/**
 * Migrate lib
 */

var fs = require('fs');

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

    // TO DO: determine group codes and teacher codes
    //        by not using this hack
    //
    // Get group codes and names from subject object
    var group_codes = item.subject.match(/\[(.*)\]/) || '';
    // Remove square brackets
    group_codes = group_codes[0].replace(/\[|\]/g, '');
    var room_codes = item.location;
    var teacher_codes = item.description.slice(group_codes.length);

    entry.subject = item.subject.slice(group_codes.length + 2).trim();
    entry.groups = this.findCodes(group_codes).map(function (code) {
      return code.name;
    });
    entry.rooms = this.findCodes(room_codes).map(function (code) {
      return code.name;
    });
    entry.teachers = this.findCodes(teacher_codes).map(function (code) {
      return code.name;
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
    });;
  }

};

module.exports = migrate;
