timeCalc = function(start, duration) {
  times = [];
  times1 = start.split(':');
  times2 = duration.split(':');

  for (var i = 0; i < 3; i++) {
    times1[i] = (isNaN(parseInt(times1[i]))) ? 0 : parseInt(times1[i])
    times2[i] = (isNaN(parseInt(times2[i]))) ? 0 : parseInt(times2[i])
    times[i] = times1[i] + times2[i];
  }

  var seconds = times[2];
  var minutes = times[1];
  var hours = times[0];

  if (seconds % 60 === 0) {
    hours += seconds / 60;
  }

  if (minutes % 60 === 0) {
    res = minutes / 60;
    hours += res;
    minutes = minutes - (60 * res);
  }

  return hours + ':' + minutes + ':' + seconds;
}

// TODO: MAKE A BETTER VERSION OF THIS THAT ACCOUNTS FOR ODD TIMES
// TODO: INTEGRATE THIS INTO DURATIONS FOR MEETINGS

module.exports = timeCalc;
