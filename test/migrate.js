/**
 * Test migrate lib
 */
var migrate = require('../libs/migrate');

var assert = require('assert');

describe('migrate lib', function () {

  var empty_input = [];
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
      room: 'Room_133',
      description: 'LEE Group_01B',
      date: 'Sat Oct 11 2014 08:00:00 GMT+0300 (EEST)',
      date_end: 'Sat Oct 11 2014 09:45:00 GMT+0300 (EEST)'
    },

    {
      subject: '[Group_01B] Entrepreneurship',
      room: 'Room_139',
      description: 'BARNES Group_01B',
      date: 'Sat Oct 11 2014 10:00:00 GMT+0300 (EEST)',
      date_end: 'Sat Oct 11 2014 10:45:00 GMT+0300 (EEST)'
    }
  ];

  it('do nothing for empty array', function () {
    assert.equal(0, migrate.fromArray(empty_input).length);
  });

  it('should parse array correctly', function () {
    var flag = false;
    var data = migrate.fromArray(input);

    assert.deepEqual(output, data);
  });

});
