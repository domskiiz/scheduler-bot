var RtmClient = require('@slack/client').RtmClient;
var WebClient = require('@slack/client').WebClient;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var botToken = process.env.BOT_USER_TOKEN || '';
var apiToken = process.env.SLACK_API_TOKEN || '';
var rtm = new RtmClient(botToken);
var apiai = require('apiai');
var app = apiai(process.env.API_AI_TOKEN);
var web = new WebClient(apiToken);
var express = require('express');
var router = express();
let channel;
let responseMsg;

// the client will emit an RTM.AUTHENTICATED event on successful connectoin with the rtm.start payload
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
    for (const c of rtmStartData.channels) {
        if (c.is_member && c.name === 'pamspam2_channel') { channel = c.id }
    }
});

rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function() {
    console.log('Pam Spam is authenticated.')
})

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  var request = app.textRequest(message.text, {
    sessionId: '6fd6f06f-c81d-4484-92b3-fe3e2afb3222'
  });

  // request.on('response', function(response) {
  //     responseMsg = response.result.fulfillment.speech;
  //     rtm.sendMessage(responseMsg, message.channel);
  // })

  request.on('response', function(response) {
      web.chat.postMessage(message.channel, 'Title of the thing', {
        "text": "Would you like to play a game?",
        "attachments": [
            {
                "text": "Choose a game to play",
                "fallback": "You are unable to choose a game",
                "callback_id": "wopr_game",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": [
                    {
                        "name": "game",
                        "text": "Falken's Maze",
                        "type": "button",
                        "value": "maze"
                    },
                    {
                        "name": "game",
                        "text": "Thermonuclear War",
                        "style": "danger",
                        "type": "button",
                        "value": "war",
                        "confirm": {
                            "title": "Are you sure?",
                            "text": "Wouldn't you prefer a good game of chess?",
                            "ok_text": "Yes",
                            "dismiss_text": "No"
                        }
                    }
                ]
            }
        ]
        }, function(err, res) {
            if (err) {
                console.log('err:', err);
            } else {
              console.log('Message sent: ', res);
            }
      });
  })
  console.log('out');
  request.on('error', function(error) {
      console.log(error);
  });
  request.end();


});


rtm.start();

router.post('/interactive', function(req, res) {
    res.send("hello the API works");
    console.log('im.replies', req)
});
