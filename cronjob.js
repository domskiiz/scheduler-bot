var User = require('./models').User;
var Task = require('./models').Task;

// Look for all reminders and filter only those that will happen tomorrow.
function cronJob() {
    Task.find()
    .populate('requesterId')
    .exec((err, allTasks) => {
        var filteredTasks = [];
        allTasks.forEach((task) => {
            var taskDate = new Date(task.day);
            var taskMinusOneDate = new Date(taskDate.setDate(taskDate.getDate() - 1)).toString();
            var currentDate = new Date(helperDates()).toString();
            if (taskMinusOneDate === currentDate) {
                filteredTasks.push(task)
            }
        })
        return filteredTasks
    })
}

function helperDates() {
    var date = new Date();
    var year = date.getFullYear().toString();
    var month = addZero((date.getMonth() + 1).toString());
    var day = addZero(date.getDate().toString());
    return year + '-' + month + '-' + day
}

function addZero(num) {
    if (num.length === 1) {
        return '0' + num
    } else {
        return num
    }
}

// Get the slack IDs of the specific users and send an RTM client message to the specified user.

module.exports = cronJob;
