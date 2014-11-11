/**
 * Config file
 */

module.exports = {

  // BrowserWindow options
  browserWindow : {
    width : (process.env.DEBUG == 'true') ? 1000 : 400, // Provide space for debugger tools
    height : 600,
    title : 'Hello world',
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
    watchDir : null
  }
};
