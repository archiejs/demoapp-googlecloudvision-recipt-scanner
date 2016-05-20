'use strict';

var Archie = require('archiejs');
require('./config/init/enhancers.js'); // Load all enhancers
var hasApis = (!process.argv[2]) || (process.argv[2] === 'app');

// Load the app's dependency tree

var deptree = require('./deptree');
var theApp = process.argv[2] || 'app';
var theAppTree = deptree[theApp];

if(!Array.isArray(theAppTree)) {
  throw new Error(theApp + ' config does not export an ARRAY.')
}

// Setup the app

var tree = Archie.resolveConfig(theAppTree, process.cwd());

Archie.createApp(tree, function(err, archie) {
    if(err){
        throw err;
    }

    if ( hasApis ) {
        require('./config/init/main').startApp(archie);
    }
    require('./config/init/welcome');
});
