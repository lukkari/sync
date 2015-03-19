/**
 * Config file
 */

module.exports = {

  // BrowserWindow options
  browserWindow : {
    width : (process.env.DEBUG == 'true') ? 1000 : 500, // Provide space for debugger tools
    height : (process.env.DEBUG == 'true') ? 700 : 320,
    title : 'Lukkari sync',
    center : true
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
    baseUrl : 'http://lukkari.dc.turkuamk.fi/',
    appToken : 'roman',
    watchDir : null
  },

  baseUrl : 'http://lukkari.dc.turkuamk.fi/'
};
