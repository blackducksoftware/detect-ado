const updater = require('../library/sync-embedded-task-version.js');

updater.updateEmbeddedVersion(function () {
  console.log("Task succesfully updated.")
}, function (err) {
  console.log(err);
})