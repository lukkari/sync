/**
* Test help lib
*/

var help = require('../lib/help');
var assert = require('assert');

describe('help lib', function () {

  it('should return unique array', function () {
    var arr = [{ hello : 'world' }, { hello : 'world' }, { hello : 'not world'}, 'a'];
    var unique = [{ hello : 'world' }, { hello : 'not world'}, 'a'];

    assert.deepEqual(help.unique(arr), unique);
  });

  it('should measure function execution time', function () {
    // Long computation
    var i = 0;
    var max = 10000000;

    function doSmth(from, to) {
      for(var i = from; i < to; i += 1) {
        var item = i*i;
      }
      return to;
    }

    var doWithTime = help.withTime(doSmth);

    assert.equal(doWithTime(i, max), max);
  });

  it('should join strings to valid url', function () {
    var href = "http://localhost.name/api/root/long/";

    assert.equal(help.joinUrl('http://localhost.name', 'api/', '/root', 'long'), href);
  });

});
