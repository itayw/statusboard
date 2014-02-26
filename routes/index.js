/*
 * GET home page.
 */

var
  sb = require('../lib/statusboard'),
  _ = require('underscore');

exports.index = function (req, res) {
  res.redirect('index.html');
};

exports.payload = function (req, res) {
  var payload = {
    sender: '',
    text: ''
  };
  switch (req.headers['x-github-event']) {
    case 'issues':
      payload.sender = req.body.sender.login;
      payload.text = req.body.action + ' issue #' + req.body.issue.id + '.';
      break;
    case 'create':
      payload.sender = req.body.sender.login;
      payload.text = 'created ' + req.body.ref_type + ' `' + req.body.ref + '`.';
      break;
    case 'push':
      payload.sender = req.body.pusher.name;
      payload.text = 'pushed on ' + req.body.ref_name + '.';
      break;
    case 'status':
      payload.text = req.body.description + ' for branch ' + req.body.branches[0].name + '.';
      break;
    case 'issue_comment':
      payload.sender = req.body.sender.login;
      payload.text = 'commented on #' + req.body.issue.id + '.';
      break;
    case 'gollum':
      payload.sender = req.body.sender.login;
      if (req.body.pages.length == 1) {
        payload.text = 'edited wiki page ' + req.body.pages[0].name;
      }
      else {
        payload.text = 'edited ' + req.body.pages.length + ' wiki pages.';
      }
      break;
    default:
      console.log('missed payload', req.headers['x-github-event'], req.body);
      payload = null;
      break;
  }

  if (payload)
    sb.io.sockets.emit('payload', payload);
  res.json({ok: 1});
};

exports.getIssues = function (resultSet, state, callback) {
  var expected = 0;
  sb.config.repos.forEach(function (repo) {
    expected++;
    sb.github.issues.repoIssues({
      repo: repo.repo,
      user: repo.user,
      state: state,
      milestone: repo.milestone,
      per_page: 1000
    }, function (err, issues) {
      expected--;
      if (issues) {
        issues.forEach(function (issue) {
          issue.labels.forEach(function (label) {
            if (!sb.config.labels || (sb.config.labels && sb.config.labels.indexOf(label.name) > -1)) {
              if (!resultSet[label.name])
                resultSet[label.name] = {
                  open: 0,
                  closed: 0,
                  total: 0,
                  people: []
                };
              resultSet[label.name][issue.state]++;
              resultSet[label.name].total++;

              var exists = _.find(resultSet[label.name].people, function (p) {
                return p.avatar_url == issue.user.avatar_url;
              });
              if (!exists)
                resultSet[label.name].people.push({avatar_url: issue.user.avatar_url});
            }
          });
        });
      }
      if (expected == 0)
        return callback(null, resultSet);
    });
  });
};

exports.buildTable = function (req, res) {
  var resultSet = {};
  exports.getIssues(resultSet, 'open', function (err) {
    exports.getIssues(resultSet, 'closed', function (err) {
      var _results = [];
      Object.keys(resultSet).forEach(function (key) {
        var result = resultSet[key];
        result.completed = (result.closed || 0) / result.total;
        result.name = key;
        //result.deadline = new Date();
        _results.push(result);
      });

      _results = _.sortBy(_results, function (result) {
        return result.completed;
      });
      _results = _results.reverse();
      res.json(_results);
    });
  });
};

exports.targetDate = function (req, res) {
  sb.github.issues.getMilestone({
    repo: sb.config.dueDate.repo,
    user: sb.config.dueDate.user,
    number: sb.config.dueDate.milestone
  }, function (err, milestone) {
    if (milestone)
      return res.json(milestone);

    return  res.json({});
  });
};