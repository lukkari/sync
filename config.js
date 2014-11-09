/**
 * Config file
 */

module.exports = {
  // BrowserWindow options
  browserWindow : {
    width : 1000,
    height : 800,
    title : 'Hello world',
    center : true
  },

  // App load file
  baseFile : 'file://' + __dirname + '/index.html'
};
