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
  baseFile : 'file://' + __dirname + '/index.html'
};
