var models = require('./models');

filterUsernames = function(slackUsernames) {
  var usernames = slackUsernames.map(function(user) {
    return user.slice(2);
  });
  return usernames;
}

getGoogleEmails = function(slackAttendees) {
  var usernames = filterUsernames(slackAttendees)
  models.User.


}
