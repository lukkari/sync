/**
 * Test migrate lib
 */
var migrate = require('../libs/migrate');

var assert = require('assert');

describe('migrate lib', function () {

  it('do nothing for empty array', function () {
    var empty_input = [];

    assert.equal(0, migrate.fromArray(empty_input).length);
  });

  it('should parse array correctly', function () {
    var input = [
      [ 'Subject', 'Start Date', 'Start Time', 'End Date',
        'End Time', 'Description', 'Location' ],

      [ '[Group_01B] Anatomy and Patophysiology', '10.11.2014',
        '8:00', '10.11.2014', '9:45', 'LEE Group_01B', 'Room_133' ],

      [ '[Group_01B] Entrepreneurship', '10.11.2014', '10:00', '10.11.2014',
        '10:45', 'BARNES Group_01B', 'Room_139' ]
    ];

    var output = [
      {
        subject: '[Group_01B] Anatomy and Patophysiology',
        location: 'Room_133',
        description: 'LEE Group_01B',
        date_start: 'Sat Oct 11 2014 08:00:00 GMT+0300 (EEST)',
        date_end: 'Sat Oct 11 2014 09:45:00 GMT+0300 (EEST)'
      },

      {
        subject: '[Group_01B] Entrepreneurship',
        location: 'Room_139',
        description: 'BARNES Group_01B',
        date_start: 'Sat Oct 11 2014 10:00:00 GMT+0300 (EEST)',
        date_end: 'Sat Oct 11 2014 10:45:00 GMT+0300 (EEST)'
      }
    ];

    assert.deepEqual(output, migrate.fromArray(input));
  });

  it('should find code and name', function () {
    var str = 'Form-A:Group of Form-A';
    var res = [{
      code : 'Form-A',
      name : 'Group of Form-A'
    }];

    assert.deepEqual(res, migrate.findCodes(str));
  });

  it('should find multiple codes and names', function () {
    var str = 'Form-A:Group of Form-A TALLEY:D. Talley';
    var res = [
      {
        code : 'Form-A',
        name : 'Group of Form-A'
      },
      {
        code : 'TALLEY',
        name : 'D. Talley'
      }
    ];

    assert.deepEqual(res, migrate.findCodes(str));
  });

  it('should process item object', function () {
    var input = {
      subject : '[Form-A:Group of Form-A] Entrepreneurship',
      location: 'Room:Room_139',
      description: 'Form-A:Group of Form-A TALLEY:D. Talley',
      date_start: 'Sat Oct 11 2014 10:00:00 GMT+0300 (EEST)',
      date_end: 'Sat Oct 11 2014 10:45:00 GMT+0300 (EEST)'
    };

    var out = {
      subject : 'Entrepreneurship',
      rooms : ['Room_139'],
      teachers : ['D. Talley'],
      groups : ['Group of Form-A'],
      date : {
        start : 'Sat Oct 11 2014 10:00:00 GMT+0300 (EEST)',
        end : 'Sat Oct 11 2014 10:45:00 GMT+0300 (EEST)'
      }
    };

    assert.deepEqual(out, migrate.processItem(input));
  });

});
