var
  github = require('github'),
  _ = require('underscore');

var statusboard = exports;

statusboard.init = function () {
  statusboard.config = require('../config.json');
  statusboard.github = new github({
    version: "3.0.0",
    // optional
    debug: true,
    protocol: "https",
    timeout: 5000
  });

  statusboard.github.authenticate(statusboard.config.auth);
};

statusboard.nextMilestone = function (user, repo, callback) {
  statusboard.github.issues.getAllMilestones({
    repo: repo,
    user: user,
    state: 'open',
    sort: 'due_date',
    direction: 'asc'
  }, function (err, milestones) {
    if (err)
      return callback(err);
    if (milestones && milestones.length > 0) {
      var milestones = _.sortBy(milestones, function (m) {
        return m.due_on;
      });
      return callback(null, milestones[0]);
    }
  });
};