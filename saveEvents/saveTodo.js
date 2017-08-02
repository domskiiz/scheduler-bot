var models = require('../models');

var google = require('googleapis');
var calendar = google.calendar('v3');
var OAuth2 = google.auth.OAuth2;

var createTodo = require('../createEvents/todo');

var oauthRoute = require('../oauthRoute');
var oauth2Client = oauthRoute.oauth2Client;

saveTodo = function(task, date) {
    var event = createTodo(task, date);
    calendar.events.insert({
        auth: oauth2Client,
        calendarId: 'primary',
        resource: event,
      }, function(err, event) {
        if (err) {
          console.log('There was an error contacting the Calendar service: ' + err);
          return;
        }
      console.log('Event created: %s', event.htmlLink);
      }
    );
  });
}

module.exports = saveTodo;
