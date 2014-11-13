/**
 * Migrate lib
 */

var fs = require('fs');

var migrate = {

  /**
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
        room: el[6],
        description: el[5],
        date: (new Date(d_start)).toString(),
        date_end: (new Date(d_end)).toString()
      };
      out.push(item);
    }

    return out;
  }

};

module.exports = migrate;
