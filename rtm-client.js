var RtmClient = require('@slack/client').RtmClient;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
// RTM_EVENTS client allows more static message receiving and sending
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

var token = process.env.BOT_USER_TOKEN || '';

var rtm = new RtmClient(token, { logLevel: 'debug' });

let channel;

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  console.log('Message:', message);
});

rtm.on(RTM_EVENTS.REACTION_ADDED, function handleRtmReactionAdded(reaction) {
  console.log('Reaction added:', reaction);
});

rtm.on(RTM_EVENTS.REACTION_REMOVED, function handleRtmReactionRemoved(reaction) {
  console.log('Reaction removed:', reaction);
});

// the client will emit an RTM.AUTHENTICATED event on successful connectoin with the rtm.start payload
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
    for (const c of rtmStartData.channels) {
        if (c.is_member && c.name === 'pamspam2_channel') { channel = c.id }
        console.log('one channel',c);
    }
    console.log(`logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name} but not yet connected to a channel`)
    console.log('channel ID', channel)
});

rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function() {
    rtm.sendMessage("PamSpam2 sent a message!", channel);
})

rtm.start();
