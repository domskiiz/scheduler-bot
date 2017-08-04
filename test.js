var google = require('googleapis');
var calendar = google.calendar('v3');
var OAuth2 = google.auth.OAuth2;

var oauthRoute = require('./oauthRoute');



var models = require('./models');

// function ManipulateIds(attendees){
// 	var ids = [];
// 	text.split(' ').forEach(function(item){
// 	    if(item[0] === ''){
// 			ids.push(item)
// 		}
// 	})
// 	var return_ids = [];
// 	ids.forEach(function(item){
// 		var unfiltered = id.split('').splice(1);
// 		unfiltered.pop();
// 		return_ids.push(unfiltered);
// 	})
// 	return return_ids;
// }

function CheckConflicts(events, time) {
    var check  = false;
	events.map(function(item) {
		if (new Date(item[0].start.dateTime) < time && time < new Date(item[0].end.dateTime)) {
			check = true;
		}
	})
	return check
}
// var message = message.text;
// var time = new Date(); //must set ==> Date object
// var ids = ManipulateIds(message);
function combineDateWithTime(d, t)
{
   return new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    t.getHours(),
    t.getMinutes(),
    t.getSeconds(),
    t.getMilliseconds()
    );
}

function returnAvailableSlots(attendees, time) {
	// var message = messageText;
	var time = time; //must set ==> Date object
	var ids = attendees;
	var availableTimeSlot = [];
	return new Promise(function(resolve, reject){
	models.User.find({
		SlackId: { $in: ids}
	})
	.then(function(users){
		return Promise.all(users.map(function(user) {
			return addEventList(user);
		}));
	})
	.then(function(allevents){
		var conflicts = false;
		while(availableTimeSlot.length <= 10){
			if(CheckConflicts(allevents, time)){
				time = new Date(time.setMinutes(time.getMinutes() + 30));
			}else{
				if(availableTimeSlot.length%3 === 0 && availableTimeSlot.length !== 0){
                    time = new Date(time.setDate(time.getDate() + 1));
                    if(CheckConflicts(allevents, time)){
                        time = new Date(time.setMinutes(time.getMinutes() + 30));
                    }else{
                        availableTimeSlot.push(time);
                    }
				}else{
					availableTimeSlot.push(time);
				}
			}
		}
        //
		resolve(availableTimeSlot);
	});
	})

}

function addEventList(user) {
	return new Promise(function(resolve, reject) {
		var oauth2Client = new OAuth2(
			process.env.GOOGLE_CLIENT_ID,
			process.env.GOOGLE_CLIENT_SECRET,
			process.env.DOMAIN
		);
		oauth2Client.setCredentials(
			{
				access_token: user.GoogleAccessToken,
				refresh_token:  user.GoogleRefreshToken,
			}
		);
		oauth2Client.refreshAccessToken(function(err, tokens) {
			if (err) {
				reject('refresh failed');
				return;
			}

			oauth2Client.setCredentials({
				access_token: tokens.access_token,
				refresh_token: tokens.refresh_token,
			});
			calendar.events.list({
				auth: oauth2Client,
				calendarId: 'primary',
				timeMin: (new Date()).toISOString(),
				maxResults: 10,
				singleEvents: true,
				orderBy: 'startTime'
			}, function(err, response) {
				if (err) {
					console.log('The API returned an error: ' + err);
					reject('The API returned an error: ' + err);
					return;
				}
				var events = response.items;
				if (events.length === 0) {
					console.log('No upcoming events found.');
					reject('no upcoming events found')
				} else {
					resolve(events);
					// for (var i = 0; i < events.length; i++) {
					//   var event = events[i];
					//   var start = event.start.dateTime || event.start.date;
					// }
				}
			});
		});

	})
}
module.exports = returnAvailableSlots;
