 document.onload = function (document, window) {

   var storage = require(__dirname + '/lib/page/storage');
   var drop = require(__dirname + '/lib/page/drop')(document, window);
   var settings = require(__dirname + '/lib/page/settings')(document, window);

   function init() {
     var baseUrl = storage.get('baseUrl');
     var appToken = storage.get('appToken');
     if(!baseUrl || !appToken) {
       toggleSettings();
     }
   }

   init();

 }(document, window);
