/**
 * Config file
 */
var help = require('./lib/help');

var config = module.exports = {

  appTitle : 'Lukkari Sync',

  // BrowserWindow options
  browserWindow : {
    width : (process.env.DEBUG == 'true') ? 1000 : 500, // Provide space for debugger tools
    height : (process.env.DEBUG == 'true') ? 700 : 320,
    title : 'Lukkari Sync',
    center : true,
    icon : __dirname + '/lib/images/app-icon.png',
  },

  // App load file
  baseFile : 'file://' + __dirname + '/index.html',

  trayIcon : __dirname + '/libs/images/tray.png',

  crashReporter : {},
  /*
  crashReporter : {
    productName: 'YourName',
    companyName: 'YourCompany',
    submitUrl: 'https://your-domain.com/url-to-submit',
    autoSubmit: true
  }*/

  stateObj : {
    baseUrl : 'http://localhost:3000/',
    appToken : 'roman',
    watchDir : null
  },

  formAPIUrl : function (baseUrl) {
    return help.joinUrl(baseUrl, 'api');
  },

  baseUrl : 'http://lukkari.dc.turkuamk.fi/'
};
