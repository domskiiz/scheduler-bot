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

var availableTimeSlot = require('./test');
var getAttendeeEmails = require('./calendarLogic/attendees');
var cronjob = require('./cronjob')
var fourHoursAway = require('./calendarLogic/fourHoursAway');

var allGrantedAccess = require('./calendarLogic/allGrantedAccess');
let handleNotGranted;

var path = require('path');
var axios = require('axios');
let channel;
let responseMsg;
let complete = false;
let notPressed;
let allDayTask;
let todo = '';
let date = '';
let time = '';
person = [];
let attendeeEmails = [];
let attendees = [];

const remindIntentId = '59efd0cc-6ec7-4539-b05b-86626f6cfe2a';
const scheduleIntentId = '2fac8e45-db14-496c-a23d-4f2f14b1d876';

var oauthRoute = require('./oauthRoute');
var auth = oauthRoute.router;

var saveMeeting = require('./saveEvents/saveMeeting');
var saveTodo = require('./saveEvents/saveTodo');
var updateAccessTokens = require('./saveEvents/updateAccessTokens');

app.use('/', auth);

let SlackId;

// the client will emit an RTM.AUTHENTICATED event on successful connectoin with the rtm.start payload
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
    for (const c of rtmStartData.channels) {
        if (c.is_member && c.name === 'pamspam2_channel') { channel = c.id }
    }
    // console.log(rtmStartData);
});

// D6G0UqQU75
// D6G0UQU75 U6FGCL7K3
// D6FGPR37T U6FCUJUUQ

rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function() {
    console.log('Pam Spam is authenticated.')

    // CRON JOB REMINDERS
    // var tasksArray = cronjob();
    // tasksArray.then((taskArray) => {
    //     taskArray.forEach((task) => {
    //         web.chat.postMessage(task.channelId, `Reminder! You have the task ${task.subject} scheduled for tomorrow. Don't forget!`, {
    //             "text": "Scheduler Bot",
    //             "username": "PamSpam2",
    //         })
    //     })
    // })
})

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
    if (message.subtype === 'message_changed') {
        var message = message.message;
    }
    if (notPressed && message.subtype !== "bot_message") {
        web.chat.postMessage(message.channel, "Please confirm before proceeding.", {
            "text": "Scheduler Bot",
            "username": "PamSpam2",
        })
    }

    if (message.subtype !== "bot_message" || message.subtype !== "message_changed"){
        SlackId = message.user;
        models.User.findOne({
            SlackId: message.user
        })
        .then(function(user){
            if(!user){
                new models.User({
                    SlackId: message.user
                }).save(function(err, user){
                    var link = 'https://34efd4e0.ngrok.io' +'/connect?SlackId='+ SlackId;
                    web.chat.postMessage(message.channel, 'Signup: ' + link, {
                        "text": '',
                        "username": "PamSpam2",
                        })
                })
            }
        })
    }

    if(!complete && message.subtype !== "bot_message"){
        var array = message.text.split(' ');
        array.forEach(function(item, index){
            if(item[0]==='<'){
                var unfiltered = item.split('').splice(2);
                unfiltered.pop()
                unfiltered = unfiltered.join('')
                array[index] = unfiltered;
            };
        })
        var text = array.join(' ');
        axios({
            method: 'post',
            url: 'https://api.api.ai/v1/query?v=20150910',
            headers: {
                'Authorization': aiToken,
                'Content-Type': 'application/json; charset=utf-8'
            },
            data: {
                query: text,
                lang: "en",
                sessionId: '6fd6f06f-c81d-4484-92b3-fe3e2afb3222',
            },
        })
        .then((response) => {
            var result = response.data.result
            if (Object.keys(result.parameters).length === 0 && !result.actionIncomplete && (message.text.split(' ')[0].toUpperCase() !== 'REMIND' || message.text.split(' ')[0].toUpperCase() !== 'SCHEDULE' )) {
                web.chat.postMessage(message.channel, result.fulfillment.speech, {
                    "text": "Scheduler Bot",
                    "username": "PamSpam2",
                })
            }
            else if (result.actionIncomplete) {
                complete = false;
                web.chat.postMessage(message.channel, result.fulfillment.speech, {
                    "text": "Scheduler Bot",
                    "username": "PamSpam2",
                })
            } else {
                todo = result.parameters.todo;
                date = result.parameters.date;
                if (result.metadata.intentId === scheduleIntentId) {
                    time = result.parameters.time;
                    attendees = result.parameters.person;
                }
                complete = true;
                models.User.findOne({
                    SlackId: message.user
                })
                .then(function(user){
                    notPressed = true;
                    var confirmText = '';
                    if (result.metadata.intentId === remindIntentId) {
                        confirmText = "Should we schedule your todo " + todo + " for " + date + " ?";
                    } else if (result.metadata.intentId === scheduleIntentId) {
                        var available = availableTimeSlot(attendees, new Date(date+'T'+time));
                        available.then((times) => {
                            var optionsArray = [];
                            times.forEach((timeslot) => {
                                optionsArray.push({ "text": `${timeslot}`, "value": `${timeslot}`})
                            })
                            // TEMPORARY!!!
                            optionsArray = [{ "text": new Date(date+'T'+time).toString(), "value": new Date(date+'T'+time).toString()}]
                            return optionsArray;
                        })
                        .then((optionsArray) => {
                            web.chat.postMessage(message.channel, "The time you sent conflicts with others' schedules.", {
                                "text": "The time you sent conflicts with others' schedules.",
                                "username": "PamSpam2",
                                "response_type": "in_channel",
                                "attachments": [
                                    {
                                        "text": "Choose a better time below:",
                                        "fallback": "If you could read this message, you'd be choosing something fun to do right now.",
                                        "color": "#3AA3E3",
                                        "attachment_type": "default",
                                        "callback_id": `{"todo": "${todo}", "date": "${date}", "time": "${time}", "attendees": "[${attendees}]", "requesterId": "${user._id}"}`,
                                        "actions": [
                                            {
                                                "name": "times_list",
                                                "text": "Pick a time.",
                                                "type": "select",
                                                "options": optionsArray
                                            }
                                        ]
                                    }
                                ]
                            })
                        })
                        attendees.forEach(function(attendee) {
                            models.User.findOne({
                                SlackId: attendee,
                            })
                            .then((user) => {
                                attendeeEmails.push({'email': user.SlackEmail})
                            })

                        })
                        confirmText = "Should we schedule your todo " + todo + " on " + time + " for " + date + " ?";
                    }
                    // web.chat.postMessage(message.channel, "Confirmation", {
                    //     "text": "Are you sure about your choice?",
                    //     "username": "PamSpam2",
                    //     "attachments": [{
                    //         "text": confirmText,
                    //         "callback_id": "confirmation", // hacky
                    //         "color": "#3AA3E3",
                    //         "attachment_type": "default",
                    //         "actions": [
                    //             {
                    //                 "name": "confirmation",
                    //                 "text": "Yes, confirm!",
                    //                 "type": "button",
                    //                 "value": "confirm"
                    //             },
                    //             {
                    //                 "name": "confirmation",
                    //                 "text": "Cancel",
                    //                 "style": "danger",
                    //                 "type": "button",
                    //                 "value": "cancel"
                    //             }
                    //         ]
                    //     }]
                    // })

                    if (result.metadata.intentId === remindIntentId) {
                        allDayTask = true;
                        new models.Task({
                            subject: todo,
                            day: date,
                            requesterId: user._id,
                            channelId: message.channel
                        }).save(function(err, task){
                            updateAccessTokens(user);
                        })
                    } else if (result.metadata.intentId === scheduleIntentId) {
                        allDayTask = false;
                        new models.Meeting({
                            subject: todo,
                            day: date,
                            time: time,
                            invitees: attendees,
                            requesterId: user._id,
                        }).save(function(err, task){
                            console.log('meeting saves it here')
                            updateAccessTokens(user);
                        })
                    }
                });
            }
        })
    }
});

rtm.start();

app.post('/interactive', (req, res) => {
    var noPermission = [];
    var payload = JSON.parse(req.body.payload)
    complete = false;
    notPressed = false;
    if (payload.actions[0].name === "confirmation") {
        if (payload.actions[0].value === "confirm") {
            var confirmation = '';
            if (allDayTask) {
                saveTodo(todo, date);
                confirmation = "Confirmed, your " + todo+ ' task on ' + date + ' has been added to your calendar!'
            } else {
                // check that all have enabled gcal access
                console.log(attendees, 'attendees about to be checked')
                attendees.forEach(function(person) {
                  models.User.findOne({
                    SlackId: person
                  })
                  .then(function(user) {
                    if (!user.SlackEmail) {
                      noPermission.push(user.SlackId);
                    }
                  })
                  .catch(function(err) {
                      console.log(err);
                      noPermission.push(err)
                  })
                });
                if (noPermission.length > 0) {
                    if (!fourHoursAway(date, time)) {
                        res.send("Meeting is too soon! Please make sure all have granted access or choose a later time.");
                    } else {
                        res.send("Not all attendees have granted access yet.");
                        handleNotGranted = true;
                    }
                } else {
                  saveMeeting(todo, date, time, attendeeEmails);
                  confirmation = "Confirmed, your " + todo+ ' task on ' + date + ' for ' + time + ' has been added to your calendar!'
                }
            }
            res.send(confirmation)
        } else if (payload.actions[0].value === "cancel") {
            res.send("Sure. Scheduling cancelled.")
        }
    } else if (payload.actions[0].name === "times_list") {
        console.log("PAYLOAD!", payload);
        console.log("SELECTED!", payload.actions[0].selected_options);
        var info = JSON.parse(payload.callback_id);
        console.log("INFO", info);
        console.log("type", typeof info);
        models.User.findOne({
            SlackId: payload.user.id
        })
        .then(function(user){
            new models.Meeting({
                subject: info.todo,
                day: info.date,
                time: info.time,
                invitees: info.attendees,
                requesterId: info.requesterId,
            }).save(function(err, task){
                updateAccessTokens(user);
            })
        })
        .then(function() {
            var confirmText = "Should we schedule your todo " + info.todo + " on " + info.time + " for " + info.date + " ?";
            web.chat.postMessage(payload.channel.id, "Confirmation", {
                "text": "Are you sure about your choice?",
                "username": "PamSpam2",
                "attachments": [{
                    "text": confirmText,
                    "callback_id": "confirmation", // hacky
                    "color": "#3AA3E3",
                    "attachment_type": "default",
                    "actions": [
                        {
                            "name": "confirmation",
                            "text": "Yes, confirm!",
                            "type": "button",
                            "value": "confirm"
                        },
                        {
                            "name": "confirmation",
                            "text": "Cancel",
                            "style": "danger",
                            "type": "button",
                            "value": "cancel"
                        }
                    ]
                }]
            })
            res.send("Cool. We'll schedule it.")
        })
    }
});

app.listen(8080, function() {
    console.log('PamSpam2 listening on port 8080.');
});

module.exports = {
    rtm: rtm,
    SlackId: SlackId,
}
