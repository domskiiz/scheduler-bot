var models = require('../models');

function allGrantedAccess(attendees) {
  var noPermission = [];
  attendees.forEach(function(person) {
    models.User.findOne({
      SlackId: person
    })
    .then(function(user) {
      if (!user.SlackEmail) {
        noPermission.push(user.SlackId);
        console.log(noPermission)
      }
    });
  });
  return noPermission;
}

module.exports = allGrantedAccess;
