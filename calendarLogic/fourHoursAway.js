fourHoursAway = function(date, time) {
  var year = Number(date.substring(0, 4));
  var month = Number(date.substring(5, 7));
  var day = Number(date.substring(8));

  var hour = Number(time.substring(0,2));
  var minute = Number(time.substring(3, 5));
  var seconds = Number(time.substring(6));

  var today = new Date();
  var meetingTime = new Date(year, month, day, hour, minute, seconds);
  var diff = Math.abs(today-meetingTime) / 1000 / 60 / 60;

  return diff > 4;
}

module.exports = fourDaysAway;
