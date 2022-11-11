require('dotenv').config();
const {App} = require('@slack/bolt');
const https = require('https');

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

app.event("app_home_opened", async ({say}) => {
  console.log("app_home_opened");
  const thingSpeakEndpoint = 'https://api.thingspeak.com/channels/1927005/fields/1/last.json';
  https.get(thingSpeakEndpoint, res => {
    let data = [];
    const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
    console.log('Status Code:', res.statusCode);
    console.log('Date in Response header:', headerDate);

    res.on('data', chunk => {
      data.push(chunk);
    });

    res.on('end', () => {
      console.log('Response ended: ');
      const response = JSON.parse(Buffer.concat(data).toString());
      let status = response.field1 === '1' ? 'POWER ON :full_moon_with_face: ' : 'POWER OFF :new_moon_with_face: '
      const createdAt = new Date(response.created_at);
      say(`Palata 505 has status ${status} \nDate ${createdAt.toLocaleString()}`);
    });
  }).on('error', err => {
    console.log('Error: ', err.message);
  });
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
