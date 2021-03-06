'use strict';

const fs = require('fs');
const os = require('os');
const readline = require('readline');
const google = require('googleapis');
const googleAuth = require('google-auth-library');
const execFile = require('child_process').execFile;
const path = require('path');
const promisify = require('es6-promisify');
const debug = require('debug')('demo-archiejs-googleauth');

// if modifying the SCOPES, you will need to delete the file in TOKEN_PATH location
var TOKEN_PATH = path.join(os.tmpdir(), '.drive-nodejs-quickstart.json');
var SCOPES;
var GOOG_LOCAL_KEYS;

// promisify
const readFilePromise = promisify(fs.readFile, fs);
const authPromise = promisify(authorize);

// Load client secrets from a local file.
var GAuthToken = function setup(options, deps) {
  var obj = this;

  SCOPES = options.scopes;
  GOOG_LOCAL_KEYS = options.credentials;

  return readFilePromise(GOOG_LOCAL_KEYS)
    .then((content) => {
      obj._creds = JSON.parse(content);
      return obj._creds;
    })
      // Authorize a client with the loaded credentials, then call the
      // Drive API.
    .then(authPromise)
    .then(() => { return obj; });
}

GAuthToken.prototype.authorize = function() {
  return authPromise(this._creds);
};

module.exports = GAuthToken;


// inner functions


/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  debug(`authorize ${credentials}`);
  var clientSecret = credentials.web.client_secret;
  var clientId = credentials.web.client_id;
  var redirectUrl = credentials.web.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (token) {
      debug('reuse the old token');
      oauth2Client.credentials = JSON.parse(token);
      if (Date.now() < oauth2Client.credentials.expiry_date) {
        return callback(null, oauth2Client);
      }
      debug('old token expired');
    }
    debug('get a new token');
    getNewToken(oauth2Client, callback);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  execFile("open", [ authUrl.toString() ]);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Cut-copy the google authorization url here: ', function(url) {
    rl.close();
    var code = url.replace(/^.*code=/, ''); // extract token code
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return callback(err);
      }
      oauth2Client.credentials = token;
      storeToken(token, (err) => {
        callback(err, oauth2Client);
      });
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token, done) {
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), done);
}
