var models = require('../models');

getAttendeeEmails = function(attendee) {
    console.log("attendee in function", attendee);
    return new Promise((resolve, reject) => {
          models.User.findOne({
            SlackId: attendee
          })
          .then(function(user) {
              resolve(user.SlackEmail)
          })
          .catch(function(err) {
              reject(err)
          })
    })
}



module.exports = getAttendeeEmails;
