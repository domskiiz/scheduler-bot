var models = require('../models');

getAttendeeEmails = function(slackAttendees) {
  var attendeeEmails = [];
  slackAttendees.forEach(function(slackId) {
    models.User.findOne({
      SlackId: slackId
    })
    .then(function(user) {
      attendeeEmails.push(user.SlackEmail);
    });
  });

  return attendeeEmails;
}

module.exports = getAttendeeEmails;
