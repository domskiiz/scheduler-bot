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
	events[0].map(function(item) {
		var time_start = new Date(item.start.dateTime);
		var time2 = new Date(time_start.setHours(time_start.getHours() - 7));
		var time_end = new Date(item.end.dateTime);
		var time3 = new Date(time_end.setHours(time_end.getHours() - 7))
	
		if (time2<= time && time <= time3) {
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
	var availableTimeSlot = {'times':[], 'check':false};
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
		var time2 = new Date(time)
		while(availableTimeSlot.times.length < 10){
			console.log(availableTimeSlot.times)
			if(CheckConflicts(allevents, time2)){
				var time2 = new Date(time.setMinutes(time.getMinutes() + 30));

			}else{
				if(availableTimeSlot.times.length%3 === 0 && availableTimeSlot.times.length !== 0 && availableTimeSlot.check===false){
					availableTimeSlot.check=true;
                    var time2 = new Date(time.setDate(time.getDate() + 1));

				}else{
					availableTimeSlot.times.push(time2);
					availableTimeSlot.check = false;
				}
			}
		}
		console.log('ava',availableTimeSlot);
		// var return_array = [];

		// console.log(return_index);
		// availableTimeSlot.times.splice(return_index);
		//
        if(availableTimeSlot.times[0] === time){
        	resolve([]);
        }else{

		var arr = availableTimeSlot.times
			arr = arr.filter( function( item, index, inputArray ) {
				return inputArray.indexOf(item) == index;
			});
			console.log(arr);
        	resolve(arr);
        }
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
