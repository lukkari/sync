var path = require('path');

module.exports = function(grunt) {
  var buildDir = path.env ? path.env.TMPDIR || path.env.TEMP || '/tmp' : '/tmp';

  grunt.initConfig({
    'build-atom-shell': {
      tag: 'v0.22.2',
      nodeVersion: '0.22.2',
      buildDir: path.join(buildDir, 'atom-shell'),
      projectName: 'lukkari-sync',
      productName: 'Lukkari Sync'
    }
  });

  grunt.loadNpmTasks('grunt-build-atom-shell');

  grunt.registerTask('default', ['build-atom-shell']);
};
