/**
 * Migrate lib
 */

var fs = require('fs');
var path = require('path');
var util = require('./util');

var migrate = function (store) {
  var names = ['groups', 'teachers', 'rooms'];

  function getCatName(code) {
    var queryFun = function (item) { return item.code === code; };
    return store.getCollectionName(names, queryFun);
  }

  function getCatNameAndItem(code) {
    var queryFun = function (item) { return item.code === code; };
    return store.getCollectionNameAndItem(names, queryFun);
  }

  /**
   * Convert date to string to the same format
   * Ex: 1/12/2015, 12.1.2015 -> 1/12/2015
   */
   function resolveDate(date) {
     if(date.indexOf('.') > -1) {
       date = date.split('.');
       date = [date[1], date[0], date[2]].join('/');
     }
     return date;
   }

  return {

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
        d_start = Date.parse(resolveDate(el[1]) + ' ' + el[2]);
        d_end = Date.parse(resolveDate(el[3]) + ' ' + el[4]);
        item = {
          subject: el[0],
          location: el[6],
          description: el[5],
          date_start: new Date(d_start).toISOString(),
          date_end: new Date(d_end).toISOString()
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

      var subject = item.subject.replace(/\[.*\]/, '').trim();
      var subjectCode = subject.match(/^(\d+\w*)/);

      if(subjectCode && subjectCode.length) {
        subjectCode = subjectCode[0];
        subject = subject.substr(subjectCode.length).trim();
      } else {
        subjectCode = '';
      }

      entry.subject = {
        name : subject,
        code : subjectCode
      };

      var categories = ['groups', 'teachers', 'rooms'];
      categories.forEach(function (cat) {
        entry[cat] = [];
      });

      var codeString = item.description + ' ' + item.location;
      var codes = this.findCodes(codeString);

      codes.forEach(function (code) {
        var obj = getCatNameAndItem(code.code);
        if(obj) {
          entry[obj.name].push(obj.item._id);
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

      var subject = item.subject.replace(/\[.*\]/, '').trim();
      var subjectCode = subject.match(/^(\d+\w*)/);

      if(subjectCode && subjectCode.length) {
        subjectCode = subjectCode[0];
        subject = subject.substr(subjectCode.length).trim();
      } else {
        subjectCode = '';
      }

      entry.subject = {
        name : subject,
        code : subjectCode
      };

      var categories = ['groups', 'teachers', 'rooms'];
      categories.forEach(function (cat) {
        entry[cat] = [];
      });

      var codes = []
        .concat(item.description.split(/\s/))
        .concat(item.location.split(/\s/));

      codes.forEach(function (code) {
        var obj = getCatNameAndItem(code);
        if(obj) {
          entry[obj.name].push(obj.item._id);
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
      var content = util.decode(util.rawRead(filepath), 'ISO-8859-1');
      var components = content.replace(/\r/g, '').match(/\[Componentdata\]\n(.+\n)+/);

      if(components && components.length) {
        return (
          components[0]
            .replace(/.*\n/, '') // Remove first line
            .trim()
            .split(/\n/)
            .filter(function (el) { return el && el.length > 0; })
        );
      }

      return null;
    },

    /**
     * Process single component
     */
    processComponent : function (line) {
      var categories = ['group', 'teacher', 'room', 'other'];
      var container = {};

      var data = line.split('=')[1];
      var items = data.split(';');

      return {
        code : items[0],
        data : {
          name : items[1],
          code : items[0]
        },
        category : categories[items[2] - 1]
      };
    }

  };

};

module.exports = migrate;
