var models = require('../models');

var google = require('googleapis');
var calendar = google.calendar('v3');
var OAuth2 = google.auth.OAuth2;

var createMeeting = require('../createEvents/meeting');

var oauthRoute = require('../oauthRoute');
var oauth2Client = oauthRoute.oauth2Client;

saveMeeting = function(user) {
  oauth2Client.setCredentials(
    {
      access_token: user[0].GoogleAccessToken,
      refresh_token:  user[0].GoogleRefreshToken,
    }
  );
  oauth2Client.refreshAccessToken(function(err, tokens) {
    oauth2Client.setCredentials(
      {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      }
    );
    var event = createMeeting('hey', '2017-08-02', '17:00:00', [{ 'email' : 'alissaaadomski@gmail.com'}])
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

module.exports = saveMeeting;
