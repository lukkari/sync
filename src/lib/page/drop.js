/**
 * Drop area controller
 */

var ipc = require('ipc');
var storage = require('./storage');

module.exports = function (document, window) {

  var selectedFile = document.querySelector('#selectedFile');
  var dropArea = document.querySelector('#dropArea');
  var syncBtn = document.querySelector('#syncBtn');
  var fileToSyncNode = document.querySelector('#fileToSync');
  var selectedFileName = document.querySelector('#selectedFileName');
  var cancelFileBtn = document.querySelector('#cancelFileBtn');

  // Event listeners
  selectedFile.addEventListener('change', fileSelectHandler, false);

  dropArea.addEventListener('dragover', fileSelectHandler, false);
  dropArea.addEventListener('dragleave', fileSelectHandler, false);
  dropArea.addEventListener('drop', fileSelectHandler, false);

  cancelFileBtn.addEventListener('click', cancelFile, false);
  syncBtn.addEventListener('click', syncFile, false);

  function fileSelectHandler(e) {
    e.stopPropagation();
    e.preventDefault();

    if(e.type == 'dragover') e.target.classList.add('hover');
    else e.target.classList.remove('hover');

    var files = e.target.files || e.dataTransfer.files;
    if(files.length) {
      processFile(files[0]);
    }
  }

  function processFile(file) {
    if(!file || typeof file !== 'object') return;
    if(file.type !== 'text/csv') {
      return alert('Only files with .csv extension are allowed');
    }

    selectedFileName.textContent = file.name;
    fileToSyncNode.style.display = 'block';
    syncBtn.style.display = 'block';

    storage.setFile(file);
  }

  function cancelFile() {
    fileToSyncNode.style.display = 'none';
    syncBtn.style.display = 'none';

    storage.rmFile();
  }

  function syncFile() {
    console.log('sync file');

    syncBtn.disabled = true;
    ipc.send('sync-file', storage.formConfig(), function (err) {
      if(err) console.log(err);

      console.log('returned');
    });
  }

  /**
   * Restore to init state
   */
  function restore() {
    cancelFile();
  }

  ipc.on('sync-error', function (err) {
    console.log(err);
    var n = new Notification('Error while syncing file', {
      body : err
    });

    syncBtn.disabled = false;
  });

  ipc.on('sync-success', function (msg) {
    console.log('success');
    restore();
    var n = new Notification('Successfull sync', {
      body : msg
    });
  });
};
