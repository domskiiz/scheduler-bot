var models = require('../../models');
var allGrantedAccess = require('./allGrantedAccess');

var botToken = process.env.BOT_USER_TOKEN || '';
var apiToken = process.env.SLACK_API_TOKEN || '';

var RtmClient = require('@slack/client').RtmClient;
var WebClient = require('@slack/client').WebClient;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

var rtm = new RtmClient(botToken);
var web = new WebClient(botToken);

alertAccess = function(attendees) {
  var noPermission = allGrantedAccess(attendees);
  if (noPermission.length > 0) {
    noPermission.forEach(function(userNeedsAccess) {

    });
  } else {
    return;
  }
}
