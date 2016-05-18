'use strict';

var passport = require('passport');

var testController = require('./../../test/controllers/auth');

exports = module.exports = function(app) {

    // gets
    app.get('/test/welcome', testController.welcome);
    app.get('/test/success', testController.success);
    app.get('/test/failure', testController.failure);

    // passport
    app.get('/test/auth/google', passport.authenticate('google', { scope : ['email'] }));
    app.get('/google/auth/callback', passport.authenticate('google', {
      successRedirect : '/test/success',
      failureRedirect : '/test/failure'
    }));

}