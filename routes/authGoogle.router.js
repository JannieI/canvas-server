// Basic imports -----------------------------------------------------------------
var express = require('express');
var authGoogleRouter = express.Router();

// Third Party modules -----------------------------------------------------------
const passport = require('passport');
const session = require('express-session');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const passportConfig = require('../config/configPassportGoogle');

const createErrorObject = require('../utils/createErrorObject.util');
const createReturnObject = require('../utils/createReturnObject.util');

// Functions ---------------------------------------------------------------------


// Runs for ALL routes ----------------------------------------------------------

// Setup Session for Passport
authGoogleRouter.use(session({
    secret: 'I love Canvas!',
    resave: false,
    saveUninitialized: true,
}))

// Passport related 
authGoogleRouter.use(passport.initialize());
authGoogleRouter.use(passport.session());
passport.use(new GoogleStrategy(passportConfig,
  (accessToken, refreshToken, profile, cb) => {
    console.log(profile)
    return cb(null, profile);
  }
));

passport.serializeUser( (user, cb)=>{
    cb(null, user);
});

passport.deserializeUser((user,cb)=>{
    cb(null, user)
});


// Methods for this Router -----------------------------------------------------------

// authGoogle/login
authGoogleRouter.get('/login', passport.authenticate('google', {
    scope: ['profile'] // Used to specify the required data
}));

authGoogleRouter.get('/callback', passport.authenticate('google',{
    successRedirect: '/',
    failureRedirect: '/loginFailed'
}));

// app.get('/auth/google/callback', passport.authenticate('google'), (req, res) => {
//     res.redirect('/secret');
// });

authGoogleRouter.get('/loginSuccess', (req, res, next) => {
    res.json(
        createReturnObject(
            "success",
            "authGoogleLogin",
            "Login worked",
            [],
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
            )
    );
});

authGoogleRouter.get('/loginFailed', (req, res, next) => {
    res.json(
        createErrorObject(
            "failed",
            "Login failed",
            null
        )
    );
});

// authGoogle/logout
authGoogleRouter.get('/logout', (req, res, next) => {
    req.logout();
    req.session.destroy( () => {
        res.clearCookie('connect.sid');
        res.json(
            createReturnObject(
                "success",
                "authGoogleLogout",
                "Logged out",
                [],
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
                )
        );
    });
});


// Export -----------------------------------------------------------
module.exports = authGoogleRouter;
