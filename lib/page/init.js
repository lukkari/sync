 document.onload = function (document, window) {

   var storage = require('./storage');
   var settings = require('./settings')(document, window);

   function init() {
     var baseUrl = storage.get('baseUrl');
     var appToken = storage.get('appToken');
     if(!baseUrl || !appToken) {
       toggleSettings();
     }
   }

   init();

 }(document, window);
