/**
 * Test migrate lib
 */
var store = require('../libs/store');
var migrate = require('../libs/migrate')(store);

var assert = require('assert');
var fs = require('fs');
var path = require('path');

describe('migrate lib', function () {

  var baseDir = path.resolve(__dirname + '/../');

  var tmpDir = path.join(baseDir, 'migrate-tmp');
  var mimosaFile = 'mimosa.mxt';
  var mimosaData = [
    '[Test]',
    'Some data',
    'bla-bla',
    '',
    '[Componentdata]',
    '1=0ATRK11mar;ALIIBK11mar;1;5;0',
    '2=0ATRK12;ALIIBK12;1;0;0',
    '3=HALJA;Jaakko Haltia;2;204;0',
    '4=MYLPÄ;Päivi Myllymäki [some text];2;16;0',
    '',
    '[AnotherTest]',
    'hello world',
    'lol'
  ];
  mimosaData = mimosaData.join('\n');

  var groupsData = [
    { code : '0ATRK12', name : 'ALIIBK12', _id : 'g1' },
    { code : 'NBIOTS12W', name : 'NBIOTS12W', _id : 'g2' }
  ];
  var teachersData = [
    { code : 'ANTMA', name : 'Marita Antikainen', _id : 't1' },
    { code : 'LEHRA', name : 'Raimo Lehto', _id : 't2' }
  ];
  var roomsData = [
    { code : 'B155(18)', name : 'B155 TIKO (18)', _id : 'r1' },
    { code : 'B213FM(X)', name : 'B213 FM', _id : 'r2' }
  ];

  before(function () {
    fs.mkdirSync(tmpDir);
    fs.writeFileSync(path.join(tmpDir, mimosaFile), mimosaData);

    store.init(tmpDir);
    store.addCollection('groups').add(groupsData);
    store.addCollection('teachers').add(teachersData);
    store.addCollection('rooms').add(roomsData);
  });

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
        date_start: '2014-10-11T05:00:00.000Z',
        date_end: '2014-10-11T06:45:00.000Z'
      },

      {
        subject: '[Group_01B] Entrepreneurship',
        location: 'Room_139',
        description: 'BARNES Group_01B',
        date_start: '2014-10-11T07:00:00.000Z',
        date_end: '2014-10-11T07:45:00.000Z'
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

  it('should process item', function () {
    var input = {
      subject : '[NBIOTS12W:NBIOTS12W] Entrepreneurship',
      location: 'B213FM(X):B213 FM',
      description: 'NBIOTS12W:NBIOTS12W LEHRA:Raimo Lehto',
      date_start: '2014-10-11T07:00:00.000Z',
      date_end: '2014-10-11T07:45:00.000Z'
    };

    var out = {
      subject : 'Entrepreneurship',
      rooms : ['r2'],
      teachers : ['t2'],
      groups : ['g2'],
      date : {
        start : '2014-10-11T07:00:00.000Z',
        end : '2014-10-11T07:45:00.000Z'
      }
    };

    assert.deepEqual(out, migrate.processItem(input, true));
  });

  it('should process old item', function () {
    var input = {
      subject : '[0ATRK12] Entrepreneurship',
      location: 'B155(18)',
      description: '0ATRK12 ANTMA',
      date_start: '2014-10-11T07:00:00.000Z',
      date_end: '2014-10-11T07:45:00.000Z'
    };

    var out = {
      subject : 'Entrepreneurship',
      rooms : ['r1'],
      teachers : ['t1'],
      groups : ['g1'],
      date : {
        start : '2014-10-11T07:00:00.000Z',
        end : '2014-10-11T07:45:00.000Z'
      }
    };

    assert.deepEqual(out, migrate.processOldItem(input));
  });

  it('should get componentdata', function () {
    var filepath = path.join(tmpDir, mimosaFile);
    var data = migrate.componentsFromMimosa(filepath);
    assert.equal(4, data.length);
  });

  it('should process component', function () {
    var input = '1=0ATRK11mar;ALIIBK11mar;1;5;0';
    var output = {
      code : '0ATRK11mar',
      data : {
        name : 'ALIIBK11mar',
        code : '0ATRK11mar'
      },
      category : 'group'
    };
    assert.deepEqual(output, migrate.processComponent(input));
  });

  after(function () {
    fs.unlinkSync(path.join(tmpDir, mimosaFile));
    store.destroy();
    // Store destroys directory
    //fs.rmdirSync(tmpDir);
  });

});
