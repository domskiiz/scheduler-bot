createMeeting = function(name, date, time, attendees) {
  return (
    {
      'summary': name,
      'start': {
        'dateTime': date + 'T' + time + '-07:00',
        'timeZone': 'America/Los_Angeles',
      },
      'end': {
        'dateTime': date + 'T' + '17:30:00' + '-07:00',
        'timeZone': 'America/Los_Angeles',
      },
      'recurrence': [
      ],
      'attendees': attendees,
      'reminders': {
        'useDefault': false,
        'overrides': [
        ],
      }
    }
  );
}

module.exports = createMeeting;
