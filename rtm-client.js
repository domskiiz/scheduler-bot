var botToken = process.env.BOT_USER_TOKEN || '';
var apiToken = process.env.SLACK_API_TOKEN || '';
var aiToken = process.env.API_AI_TOKEN || '';

var RtmClient = require('@slack/client').RtmClient;
var WebClient = require('@slack/client').WebClient;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

var rtm = new RtmClient(botToken);
var web = new WebClient(botToken);

var express = require('express');
var app = express();
var request = require('request');
var models = require('./models');
var google = require('googleapis');
var calendar = google.calendar('v3');
var OAuth2 = google.auth.OAuth2;


var path = require('path');
var axios = require('axios');
let channel;
let responseMsg;

var oauthRoute = require('./oauthRoute');
var auth = oauthRoute.router;
var oauth2Client = oauthRoute.oauth2Client; 
app.use('/', auth);

let SlackId;


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

    if (message.subtype !== "bot_message"){
        SlackId = message.user;
        models.User.findOne({
            SlackId: message.user
        })
        .then(function(user){
            if(!user){
                new models.User({
                    SlackId: message.user
                }).save(function(err, user){
                    console.log('in');
                    var link = 'https://152214c0.ngrok.io' +'/connect?SlackId='+ SlackId;
                    web.chat.postMessage(message.channel, 'Signup: ' + link, {
                        "text": '',
                        "username": "PamSpam2",
                        })  
                })
            }
        })
    }
    if(message.text.split(' ')[0] === 'Remind' ||  message.text.split(' ')[0] === 'Schedule'){
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
            models.User.find({
                SlackId: message.user
            })
            .then(function(user){
                var parameters = response.data.result.parameters;
                var todo =  parameters.todo;
                var date = parameters.date;
                var confirmation = "Confirmed, your " + todo+ ' task on ' + date + ' has been added to your calendar!';
                new models.Task({
                    subject: todo,
                    day: date,
                    requesterId: user._id,
                }).save(function(err, task){
                    console.log(user);
                        oauth2Client.refreshAccessToken(function(err, tokens) {
                            oauth2Client.setCredentials({
                                access_token: tokens.access_token,
                                refresh_token: tokens.refresh_token,
                                expiry_date: true
                            });
                            var event = {
                            'summary': 'Test todo',
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
                        })
                        

                        
          

                    if (message.subtype !== "bot_message") {
                        web.chat.postMessage(message.channel, confirmation, {
                            "text": "Scheduler Bot",
                            "username": "PamSpam2",
                            })
                            .then((webMessage) => {
                                // console.log(webMessage);
                            })
                    }
                }) 
            });

        })
}
});

// router.post('/interactive', (req, res) => {
//     var payload = JSON.parse(req.body.payload)
//     console.log('Payload', payload);
//     if (payload.actions[0].value === "schedule") {
//         res.send("Cool. We'll schedule something soon.")
//     } else if (payload.actions[0].value === "cancel") {
//         res.send("Allrighty. Scheduling cancelled.")
//     }
// });

// router.listen(8080, function() {
//     console.log('PamSpam2 listening on port 8080.');
// });

rtm.start();


app.post('/interactive', (req, res) => {
    var payload = JSON.parse(req.body.payload)
    console.log('Payload', payload);
    if (payload.actions[0].value === "schedule") {
        res.send("Cool. We'll schedule something soon.")
    } else if (payload.actions[0].value === "cancel") {
        res.send("Allrighty. Scheduling cancelled.")
    }
});

app.listen(8080, function() {
    console.log('PamSpam2 listening on port 8080.');
});


module.exports = {
    rtm: rtm,
    SlackId: SlackId,
}