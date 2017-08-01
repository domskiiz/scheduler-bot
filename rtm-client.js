var RtmClient = require('@slack/client').RtmClient;
var WebClient = require('@slack/client').WebClient;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

var botToken = process.env.BOT_USER_TOKEN || '';
var apiToken = process.env.SLACK_API_TOKEN || '';
var aiToken = process.env.API_AI_TOKEN || '';

var rtm = new RtmClient(botToken);
var web = new WebClient(botToken);

var express = require('express');
var request = require('request');
var router = express();

var path = require('path');
// var urlencodedParser = bodyParser.urlencoded({ extended: false })
var axios = require('axios');
let channel;
let responseMsg;

var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

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
  axios({
      method: 'post',
      url: 'https://api.api.ai/v1/query?v=20150910',
      headers: {
          'Authorization': aiToken,
          'Content-Type': 'application/json; charset=utf-8'
      },
      data: {
          query: message.text,
          lang: "en",
          sessionId: '6fd6f06f-c81d-4484-92b3-fe3e2afb3222',
      },
  })
  .then((response) => {
      if (message.subtype !== "bot_message") {
          web.chat.postMessage(message.channel, 'Scheduler Bot', {
            "text": "Scheduler Bot",
            "username": "PamSpam2",
            "attachments": [
                {
                    "text": "Would you like to schedule a meeting?",
                    "fallback": "You are unable to choose a game",
                    "callback_id": "interactive",
                    "color": "#3AA3E3",
                    "attachment_type": "default",
                    "actions": [
                        {
                            "name": "schedule",
                            "text": "Yes",
                            "type": "button",
                            "value": "schedule"
                        },
                        {
                            "name": "schedule",
                            "text": "Cancel",
                            "style": "danger",
                            "type": "button",
                            "value": "cancel",
                        }
                    ]
                }
            ]
            })
            .then((webMessage) => {
                // console.log(webMessage);
            })
      }
  })
});

router.post('/interactive', (req, res) => {
    var payload = JSON.parse(req.body.payload)
    console.log('Payload', payload);
    if (payload.actions[0].value === "schedule") {
        res.send("Cool. We'll schedule something soon.")
    } else if (payload.actions[0].value === "cancel") {
        res.send("Allrighty. Scheduling cancelled.")
    }
});

router.listen(8080, function() {
    console.log('PamSpam2 listening on port 8080.');
});

rtm.start();
