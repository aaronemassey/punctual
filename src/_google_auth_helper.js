var google = require('googleapis');
var fs = require('fs');
var OAuth2 = google.auth.OAuth2;
var path = require('path');
//var fetch = require('node-fetch');
var os = require('os')

let oauth2_creds_filepath = path.join(__dirname, '../','api_credentials', 'google_oauth2_secret.json');

var fileJSONCredentials = fs.readFileSync(oauth2_creds_filepath);
var parsedJSONCredentials = JSON.parse(fileJSONCredentials);

const herokuURL = parsedJSONCredentials.web.redirect_uris[0];
var chosenUrl = 'http://localhost:5000/api/enable_google_calendar';

if (process.env.PORT) {
    chosenUrl = herokuURL;
    console.log('got here')
}




var oauth2Client = new OAuth2(
    parsedJSONCredentials.web.client_id,
    parsedJSONCredentials.web.client_secret,
    chosenUrl
)

var scopes = ['https://www.googleapis.com/auth/calendar'];

var url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    approval_prompt: 'force'
});

console.log(url);

module.exports = {
    OAuth2TokenGetURI : url,
    OAuthClient : oauth2Client,
    redirectURL : chosenUrl


}
