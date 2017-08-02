var google = require('googleapis');
var calendar = google.calendar('v3');
var OAuth2 = google.auth.OAuth2;

var oauthRoute = require('../oauthRoute');
var oauth2Client = oauthRoute.oauth2Client;

updateAccessTokens = function(user) {
  oauth2Client.setCredentials(
    {
      access_token: user[0].GoogleAccessToken,
      refresh_token:  user[0].GoogleRefreshToken,
    }
  );
  oauth2Client.refreshAccessToken(function(err, tokens) {
      oauth2Client.setCredentials({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
      });
  });
}

module.exports = updateAccessTokens;
