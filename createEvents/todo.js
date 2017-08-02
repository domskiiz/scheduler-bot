createTodo = function(task, date) {
    return (
      {
        'summary': task,
        'start': {
          'date': date,
          'timeZone': 'America/Los_Angeles',
        },
        'end': {
          'date': date,
          'timeZone': 'America/Los_Angeles',
        },
        'recurrence': [
        ],
        'attendees': [
        ],
        'reminders': {
          'useDefault': false,
          'overrides': [
          ],
        }
      }
  );
}

module.exports = createTodo;
