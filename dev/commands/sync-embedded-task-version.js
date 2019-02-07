const updater = require('../library/sync-embedded-task-version.js');

updater.updateEmbeddedVersion(function () {
  console.log("Task successfully updated.")
}, function (err) {
  console.log(err);
})
