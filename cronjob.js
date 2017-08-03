var User = require('./models').User;
var Task = require('./models').Task;

// Look for all reminders and filter only those that will happen tomorrow. 
function cronJob() {
    Task.find()
    .then((tasks) => {
        console.log(tasks)
    })
}


// Get the slack IDs of the specific users and send an RTM client message to the specified user. 


// var Taskschema = schema({
// 	subject: {
//         type: String,
//         required: true
//     },
//     day: {
//         type: String,
//         required: true
//     },
//     calendar_eventId: {
//         type: String
//     },
// 	requesterId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: User,
// 	}
// })

module.exports = cronJob; 