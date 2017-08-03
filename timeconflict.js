
function ManipulateIds(text){
	var ids = [];
	text.split(' ').forEach(function(item){
	    if(item[0] === '<'){
			ids.push(item)
		}
	})
	var return_ids = [];
	ids.forEach(function(item){
		var unfiltered = id.split('').splice(1);
		unfiltered.pop();
		return_ids.push(unfiltered);
	})
	return return_ids;
}


function CheckConflicts(events, time){
    events.forEach(function(item){
        if( new Date(item.start.dateTime) < time && time < new Date((item.end.dateTime)) {
            return true;
        }
    })
    return false;
}
var message = message.text;
var time = new Date(); //must set ==> Date object
var ids = ManipulateIds(message);

models.User.find({
    SlackId: { $in: ids}
	})
	.then(function(users){
		//updateAccessTokens(user);
    var events_all = [];
	users.forEach(function(item){
	  oauth2Client.setCredentials(
	    {
	      access_token: item.GoogleAccessToken,
	      refresh_token:  item.GoogleRefreshToken,
	    }
	  );
	  oauth2Client.refreshAccessToken(function(err, tokens) {
	      oauth2Client.setCredentials({
	          access_token: tokens.access_token,
	          refresh_token: tokens.refresh_token,
	      });
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
		      return;
		    }
		    var events = response.items;
		    if (events.length === 0) {
		      console.log('No upcoming events found.');
		    } else {
		    	events_all.push(events);
		      // for (var i = 0; i < events.length; i++) {
		      //   var event = events[i];
		      //   var start = event.start.dateTime || event.start.date;
		      // }
		    }
		  });

        })
        return events_all;

    })
    .then(function(allevents){
		var conflicts = false;
		var availableTimeSlot = [];
			while(availableTimeSlot.length < 10){
				if(CheckConflicts(allevents, time)){
					time.setMinutes(time.getMinutes() + 30);
				}else{
					if(availableTimeSlot.length%3 === 0){
						time.setDate(time.getDate() + 1);
					}else{
						availableTimeSlot.push(time);
					}
				}
			}
		//

    })
