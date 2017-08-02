var express = require('express');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var calendar = google.calendar('v3');
var bodyParser = require('body-parser');
var router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());


var User = require('./models').User;
var Task = require('./models').Task;
var SlackId;

var oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.DOMAIN
);

//renders the consent page
router.get('/connect/', function(req, res) {
  SlackId = req.query.SlackId;
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

router.get('/auth', function(req, res) {
  console.log(req.query.code);
  res.send('success');
  oauth2Client.getToken(req.query.code, function(err, tokens) {
    if (!err) {
      console.log(req.query.code);
      console.log(tokens);
      oauth2Client.setCredentials(tokens);
      // var newUser = new User({
      //   GoogleAccessToken: tokens.access_token,
      //   GoogleRefreshToken: tokens.refresh_token,
      //   GooglePprofileId: tokens.id_token,
      // });
      
      console.log(tokens);
      User.findOneAndUpdate({
        SlackId: SlackId        
      }, {$set:{
        GoogleAccessToken: tokens.access_token,
        GoogleRefreshToken: tokens.refresh_token,
        GooglePprofileId: tokens.id_token,
        GoogleCode: req.query.code
      }}, function(err,doc) {
        console.log(doc);
      });
    }
  })

})

module.exports = {
  router,
  oauth2Client: oauth2Client
}
