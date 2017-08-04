var connect = process.env.MONGODB_URI;
var mongoose = require('mongoose');
mongoose.connect(connect);
var schema = mongoose.Schema;


var Userschema = schema({
    SlackId: {
        type: String
    },
    SlackEmail:{
        type: String
    },
    SlackUsername:{
        type: String
    },
    DefaultMeetingLength:{
        type: Number
    },
    GoogleAccessToken:{
        type: String
    },
    GoogleRefreshToken:{
        type: String
    },
    GooglePprofileId:{
        type: String
    },
    GoogleCode: {
        type: String
    }
})
var Taskschema = schema({
	subject: {
        type: String,
        required: true
    },
    day: {
        type: String,
        required: true
    },
    calendar_eventId: {
        type: String
    },
    channelId: {
        type: String
    },
	requesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
	}
})

var Meetingschema = schema({
    day:{
        type: String,
        required: true
    },
    time:{
        type: String,
        required: true
    },
    // invitees:{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User'
    // },
    subject:{
        type: String
    },
    location:{
        type: String
    },
    meetingLength:{
        type: Number
    },
    calendar_fields:{
        type: String
    },
    status:{
        type: String
    },
    createdAt:{
        type: String
    },
    requesterId:{
        type: String
    }
})

var Inviteschema = schema({
    EventId:{
        type: String
    },
    InviteeId:{
        type: String
    },
    RequesterId:{
        type: String
    },
    Status:{
        type: String
    }
})
var User = mongoose.model('User', Userschema);

var Task = mongoose.model('Task', Taskschema);

var Meeting = mongoose.model('Meeting', Meetingschema);

var Invite = mongoose.model('Invite', Inviteschema);

module.exports = {
    User: User,
    Task: Task,
    Meeting: Meeting,
    Invite: Invite,
}
