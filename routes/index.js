/*
 * GET home page.
 */

var _ = require('underscore');

exports.index = function (req, res) {
  res.render('index', { title: 'Express' });
};

exports.payload = function (req, res) {
  console.log('payload', req.body);
  res.json({ok: 1});
};

exports.projects = function (req, res) {
  var GitHubApi = require("github");

  var github = new GitHubApi({
    version: "3.0.0",
    // optional
    debug: true,
    protocol: "https",
    timeout: 5000
  });

  github.authenticate({
    type: "basic",
    username: '',
    password: ''
  });

  github.issues.getLabels({
    repo: 'joola.io',
    user: 'joola'
  }, function (err, labels) {
    if (err)
      throw err;
    labels.forEach(function (label) {
      console.log('listing issues for', label.name);
      github.issues.getAll({labels: label.name}, function (err, issues) {
        console.log('issue', issues)
      });
    });
  });
};


exports.nextMilestone = function (req, res) {
  var GitHubApi = require("github");

  var github = new GitHubApi({
    version: "3.0.0",
    // optional
    debug: true,
    protocol: "https",
    timeout: 5000
  });

  github.authenticate({
    type: "basic",
    username: '',
    password: ''
  });

  github.issues.getAllMilestones({
    repo: 'joola.io',
    user: 'joola',
    state: 'open',
    sort: 'due_date',
    direction: 'asc'
  }, function (err, milestones) {
    if (err)
      throw err;
    if (milestones && milestones.length > 0) {
      var milestones = _.sortBy(milestones, function (m) {
        return m.due_on;
      });
      res.json(milestones[0]);
    }

  });
};