 document.onload = function (document, window) {   
   var $query = function (q) {
     return document.querySelector(q)
   };
   
   function init() {
     var baseUrl = localStorage.getItem('baseUrl');
     var appToken = localStorage.getItem('appToken');
     if(!baseUrl || !appToken) {
       toggleSettings();
     }
   }
   
   /**
    * Settings modal functionality
    */   
   var openSettingsBtn = $query('#openSettingsBtn');
   var closeSettingsBtn = $query('#closeSettingsBtn');
   var settingsOverlay = $query('#overlay');
   var settingsNode = $query('#settings');
   
   function toggleSettings() {
     var style = settingsNode.style;
     var state = style.display == 'none' ? 'block' : 'none';
     
     style.display = state;
     settingsOverlay.style.display = state;
   }
   
   function closeSettings() {
     var baseUrl = localStorage.getItem('baseUrl');
     var appToken = localStorage.getItem('appToken');
     if(!baseUrl || !appToken) {
       return alert('Specify server location and application token first');
     }
     
     toggleSettings();
   }
   
   openSettingsBtn.addEventListener('click', toggleSettings, false);
   closeSettingsBtn.addEventListener('click', closeSettings, false);
   settingsOverlay.addEventListener('click', closeSettings, false);
   
   
   /**
    * Drop area functionality
    */
   var selectedFile = $query('#selectedFile');
   var dropArea = $query('#dropArea');
   var syncBtn = $query('#syncBtn');
   var fileToSyncNode = $query('#fileToSync');
   var selectedFileName = $query('#selectedFileName');
   var cancelFileBtn = $query('#cancelFileBtn');
   
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
   }
   
   function cancelFile() {
     fileToSyncNode.style.display = 'none';
     syncBtn.style.display = 'none';
   }
   
   function syncFile() {
     console.log('sync file');
     syncBtn.disabled = true;
   }
   
   /**
    * Settings module
    */
   var baseUrl = $query('#baseUrl');
   var appToken = $query('#appToken');
   var isFileToBeRemoved = $query('#isFileToBeRemoved');
   var isQuitApp = $query('#isQuitApp');
   
   baseUrl.addEventListener('change', function () {
     localStorage.setItem('baseUrl', baseUrl.value);
   }, false);
   
   appToken.addEventListener('change', function () {
     localStorage.setItem('appToken', appToken.value);
   }, false);
   
   isFileToBeRemoved.addEventListener('change', function () {
     localStorage.setItem('isFileToBeRemoved', isFileToBeRemoved.checked);
   }, false);
   
   isQuitApp.addEventListener('change', function () {
     localStorage.setItem('isQuitApp', isQuitApp.checked);
   }, false);
   
   // Restore saved value
   baseUrl.value = localStorage.getItem('baseUrl') || '';
   appToken.value = localStorage.getItem('appToken') || '';
   
   isFileToBeRemoved.checked = (
     localStorage.getItem('isFileToBeRemoved') == 'true' ?
     true :
     false
   );
   
   isQuitApp.checked = (
     localStorage.getItem('isQuitApp') == 'true' ?
     true :
     false
   );
   
   init();
   
 }(document, window);