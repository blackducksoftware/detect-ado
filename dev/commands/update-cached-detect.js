const updater = require('../library/update-cached-detect.js');

updater.updateCachedDetect(function () {
  console.log("Detect script successfully updated.")
}, function (err) {
  console.log(err);
})
