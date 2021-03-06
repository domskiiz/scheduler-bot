/* *****************************************************************************
Copyright 2016 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License")
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
********************************************************************************

This is a sample Slack bot built with Botkit.
*/
var apiai = require('apiai');

var app = apiai(process.env.API_AI_TOKEN);

// Text Request is where we put the message sent by the user.
var request = app.textRequest('Remind me to do chore next Friday', {
  sessionId: '6fd6f06f-c81d-4484-92b3-fe3e2afb3222'
});

// fulfillment.speech is what we get from API.AI and send back to the user.
request.on('response', function(response) {
    console.log(response.result.fulfillment.speech);
});

request.on('error', function(error) {
    console.log(error);
});

request.end();


//to
