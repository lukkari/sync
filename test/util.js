/**
* Test util lib
*/

var util = require('../libs/util');

var assert = require('assert');

var assert = require('assert');

describe('util lib', function () {

  it('should return unique array', function () {
    var arr = [{ hello : 'world' }, { hello : 'world' }, { hello : 'not world'}, 'a'];
    var unique = [{ hello : 'world' }, { hello : 'not world'}, 'a'];

    assert.deepEqual(util.unique(arr), unique);
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

    var doWithTime = util.withTime(doSmth);

    assert.equal(doWithTime(i, max), max);
  });

});
