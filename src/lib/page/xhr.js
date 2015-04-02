/**
 * Xhr module
 */

function xhr(method, url, cb) {
   request = new XMLHttpRequest();
   request.open(method, url, true);

   request.onload = function () {
     if (this.status >= 200 && this.status < 400){
       cb(null, this.response);
     } else {
       cb(new Error('Fetching error'));
     }
   };

   request.onerror = function () {
     cb(new Error('Connection error'));
   };

   request.send();

   return {
     abort : function () { return request.abort; }
   };
 }

 function isValidServer(url, cb) {
   var pingUrl = url.replace(/\/*$/, '') + '/api/timestamp';

   return xhr('GET', pingUrl, function (err) {
     if(err) return cb(false);

     return cb(true);
   });
 }

 module.exports = {
   xhr : xhr,
   isValidServer : isValidServer
 };
