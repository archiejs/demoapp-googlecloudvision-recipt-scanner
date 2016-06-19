'use strict';

var readline = require('readline');

var drive;
var scanner;
var readline;

module.exports = function setup(options, deps, ready) {
  drive = deps.GoogleDrive;
  scanner = deps.ScanReceipt;
  readline = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log(deps);

  // 1. Get the token
  // 2. Get the drive directory
  // 3. Prepare list of files to scan
  // 4. Prepare an output.txt in the same folder

  var auth;

  return new Promise((resolve) => {
    console.log('getTokenFromUser');
    deps.googAuthToken(resolve);
  }).then((_auth) => {
    auth = _auth;
  }).then(() => {
    console.log("getTaskDetailsFromUser");
    return new Promise((resolve) => {
      getTaskDetailsFromUser(resolve);
    });
  }).then((resolve) => {
    console.log("getFilesFromDrive");
    return new Promise((resolve) => {
      getFilesFromDrive(resolve);
    });
  }).then(() => {
    ready();
  });
  
};

function getTaskDetailsFromUser(done) {
  console.log('getTaskDetailsFromUser');
  var data = {};
  new Promise()
    .then(function(done, fail) {
      readline.question('What is the month on the reciepts (1-12) : ', function(month) {
        if(month) {
          data.month = month;
        }
        done();
      });
    })
    .then(function(done, fail) {
      readline.question('What is the year on reciepts (YY) : ', function(year) {
        if(year) {
          data.year = year;
        }
        done();
      });
    });
}

function getFilesFromDrive(resolve) {
  console.log('getFilesFromDrive');
  resolve();
}

function doScanNewReciepts() {
  console.log('doScanNewReciepts');
}

function doPrepareReport() {
  console.log('doPrepareReport');
}
