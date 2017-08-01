var express = require('express');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var calendar = google.calendar('v3');

var app = express();

var User = require('./mongoschema').User;
console.log(User)

var oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.DOMAIN
);

//renders the consent page
app.get('/', function(req, res) {

  var url = oauth2Client.generateAuthUrl({
    access_type: 'offline', //gets us a refresh token
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/calendar'
    ],
    state: encodeURIComponent(JSON.stringify({
      auth_id: req.query.auth_id
    }))
  });

  res.redirect(url);
});

app.get('/auth', function(req, res) {
  console.log(req.query.code);
  res.send('success');
  oauth2Client.getToken(req.query.code, function(err, tokens) {
    if (!err) {
      oauth2Client.setCredentials(tokens);
      var newUser = new User({
        GoogleAccessToken: tokens.access_token,
        GoogleRefreshToken: tokens.refresh_token,
        GooglePprofileId: tokens.id_token,
      });
      newUser.save(function(err) {
        if(err){
          console.log(err, 'could not save user');
        } else {
          console.log('user saved')
        }
      });

      var event = {
        'summary': 'TESTING',
        'description': '//TBC',
        'start': {
          'date': '2017-08-29',
          'timeZone': 'America/Los_Angeles',
        },
        'end': {
          'date': '2017-08-29',
          'timeZone': 'America/Los_Angeles',
        },
        'recurrence': [
        ],
        'attendees': [
        ],
        'reminders': {
          'useDefault': false,
          'overrides': [
          ],
        },
      };

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
      });

    }
  })

})




var port = process.env.PORT || 3000;
app.listen(port);
console.log('Express started. Listening on port %s', port);

module.exports = app;
