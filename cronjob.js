var User = require('./models').User;
var Task = require('./models').Task;

// Look for all reminders and filter only those that will happen tomorrow.
function cronJob() {
    var allTasks;
    return Task.find()
    .populate('requesterId')
    .exec((err, allTasks) => {
        return allTasks

    })
    .then((allTasks) => {
        return returnTasks(allTasks)
        .then((filteredTasks) => {
            allTasks = filteredTasks;
            return allTasks;
        })
    })
    .then((tasks) => {
        // console.log('tasks!!!!', tasks);
        // console.log('type!!!', typeof tasks);
        return tasks;
    })
};

function returnTasks(allTasks) {
    return new Promise(function(resolve, reject) {
        var newAllTasks = allTasks.filter(function(task) {
            var taskDate = new Date(task.day);
            var taskMinusOneDate = new Date(taskDate.setDate(taskDate.getDate() - 1)).toString();
            var currentDate = new Date(helperDates()).toString();
            if (taskMinusOneDate === currentDate) {
                return task
            }
        })
        resolve(newAllTasks)
    });
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
