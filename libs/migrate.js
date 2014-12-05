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

    // Get group codes and names from subject object
    var group_codes = item.subject.match(/\[(.*)\]/) || '';
    group_codes = group_codes[0];
    var room_codes = item.location;
    var teacher_codes = item.description.slice(group_codes.length - 2);

    group_codes = this.findCodes(group_codes);
    room_codes = this.findCodes(room_codes);
    teacher_codes = this.findCodes(teacher_codes);

    return entry;
  },

  /**
   * Find codes
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
    var found = [];
    var codes = str.match(/[a-z0-9_-]+:[a-z0-9 -_.]+/ig);

    // When nothing matched return empty array
    if(!codes) return found;

    found = codes.map(function (item) {
      var i = item.indexOf(':');
      return {
        code : item.slice(0, i),
        name : item.slice(i + 1)
      };
    });

    return found;
  }

};

module.exports = migrate;
