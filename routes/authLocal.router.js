// Authenticate (verify, signup, login) routes

// Basic Express imports -----------------------------------------------------------------
const express = require('express');
const router = express.Router();

// Third Party imports -------------------------------------------------------------------
const passport = require('passport');
const jwt = require('jsonwebtoken');
const debugDev = require('debug')('app:dev');

const UserModel = require('../models/canvasUsers.model');
const createErrorObject = require('../utils/createErrorObject.util');
const createReturnObject = require('../utils/createReturnObject.util');

// Verify User as valid (exists in Canvas DB)
router.post('/verify', (req, res, next) => {

    const startPos = module.id.lastIndexOf("/");
    if (startPos > 0  &&  startPos < module.id.length) {
        moduleName = module.id.substring(startPos + 1);
    };

    // Find the user: add if not found, else raise message
    UserModel.find( { companyName: req.body.companyName, userID: req.body.userID },
        (err, user) => {

        // Mongo Error
        if (err) {
            debugDev(moduleName + ": " + '    Error DB in Find ', err, 'body', req.body);
            return res.json(
                createErrorObject(
                    "error",
                    "Error in DB Find: " + err.message,
                    err
                )
            );
        };

        // Create a new user record since it does not exist
        if (user.length != 0) {
            return res.send(true);
        } else {
            return res.send(false);
        };
    });
});


// Register (Signup) a new user to a given Canvas-Server and CompanyName
// curl -v -X POST http://localhost:8000/signup -H "application/json" -d 'password=jannie' -d 'email=jannie@gmail.com'
router.post('/signup', (req, res, next) => {

    const startPos = module.id.lastIndexOf("/");
    if (startPos > 0  &&  startPos < module.id.length) {
        moduleName = module.id.substring(startPos + 1);
    };

    // Note: we are not using passport.authenticate('signup'... to validate and add the user 
    //       (see /login route)

    // Find the user: add if not found, else raise message
    UserModel.find( { companyName: req.body.companyName, userID: req.body.userID },
        (err, user) => {

        // Mongo Error
        if (err) {
            debugDev(moduleName + ": " + '    Error in Find ', err);
            return res.json(
                createErrorObject(
                    "error",
                    "Error in DB Find: " + err.message,
                    err
                )
            );
        };

        // Create a new user record since it does not exist
        if (user.length == 0) {
            var newUser = UserModel({
                companyName: req.body.companyName,
                userID: req.body.userID,
                email: 'Unknown',
                password: req.body.password,
                createdBy: '',
                createdOn: null,
                updatedBy: '',
                updatedOn: null
            });

            // Save the record
            newUser.save()
                .then(user => {

                    //Success
                    debugDev(moduleName + ": " + '    Success for ', user);
                    return res.json(
                        createReturnObject(
                            "success",
                            "authLocalSignup",
                            "Signup successful",
                            [user],
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null
                            ));
                })
                .catch(err => {
                    // Save Failed
                    debugDev(moduleName + ": " + '    Save user failed: ', err);
                    return res.json(
                        createErrorObject(
                            "failed",
                            "Registration failed, cannot save user !",
                            err
                        )
                    );
                });
        } else {
            
            // User already exists
            debugDev(moduleName + ": " + '    User Already exists ', user);
            return res.json(
                createErrorObject(
                    "failed",
                    "User already exists for this Company",
                    null
                )
            );
        };
    });

});

// Login with userId and password
// curl -v -X POST http://localhost:8000/login -H "application/json" -d 'password=jannie' -d 'email=jannie@gmail.com'
router.post('/login', (req, res, next) => {

    const startPos = module.id.lastIndexOf("/");
    if (startPos > 0  &&  startPos < module.id.length) {
        moduleName = module.id.substring(startPos + 1);
    };

    // Do the login via Passport
    passport.authenticate('login', (err, user, info) => {
    
        try
            {

                if(err || !user){
                    debugDev(moduleName + ": " + 'authLocalRouter Error after passport.authenticate')

                    // return next(error);
                    return res.json(
                        createErrorObject(
                            "failed",
                            "Login failed",
                            err
                        )
                    );
                };
                req.login(user, { session : false }, async (error) => {
                    if( error ) return next(error)

                    // The payload is part of the Token (Header, Payload, Verify Signature).  Store  
                    // enough about the user profile, but DONT include sensitive information like
                    // password.
                    const body = { _id : user._id, userID : user.userID };
                    const payload = {
                        "sub": "1234567890",
                        "_id" : user._id, 
                        "userID" : user.userID,
                        "name": user.name
                    };

                    // Sign the JWT token and populate the payload, expiring in 1d
                    // TODO 1d has to be parameterised in the System settings
                    const token = jwt.sign(payload,'top_secret', {expiresIn: '1d'});

                    // Send back info, which includes the token.  Client side we have a standard message
                    // layout, where the token is optional.
                    return res.json(
                        createReturnObject(
                            "success",
                            "authLocalLogin",
                            "User Logged into Server",
                            [],
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            token
                        )
                    );
                });
            }
        catch (error) {
            return next(error);
        };

    })(req, res, next);

});

router.get('/profile', (req, res, next) => {
    //We'll just send back the user details and the token

    const startPos = module.id.lastIndexOf("/");
    if (startPos > 0  &&  startPos < module.id.length) {
        moduleName = module.id.substring(startPos + 1);
    };

    res.json(
        createReturnObject(
            "success",
            "authLocalProfile",
            "You made it to the secure route",
            [req.user],
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            req.query.secret_token
        )
    );
});

// Export
module.exports = router;