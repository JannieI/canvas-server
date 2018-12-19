// Passport (and JWT ) related functions for login, jwt-verify

const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const UserModel = require('../model/models');

//Create a passport middleware to handle user registration
// TODO - remove XXX in route (else it fires), or whole function
passport.use('XXXsignupXXX', new localStrategy(
    {
        usernameField: 'userID',
        passwordField: 'password',
    }, async (username, password, done) => {
        try {
            console.log('auth.signup: try block start')
            console.log('');

            // Determine if user already exists in the database
            UserModel.find( { companyName: 'Clarity Analytics', userID: username }, 
                (err, user) => {
                if (err) {

                    // Create a new user record since it does not exist
                    var newUser = UserModel({
                        companyName: 'Clarity Analytics',
                        userID: username,
                        email: username + '@clarityanalytics.xyz',
                        password: password,
                        createdBy: '',
                        createdOn: null,
                        updatedBy: '',
                        updatedOn: null

                    });

                    // save the user
                    newUser.save((err) => {
                        if (err) {
                            console.log('passport use signup failed: ', err);
                            throw err;
                        };

                        console.log('.save: User created!');
                    }); 

                    //Send the user information to the next middleware
                    console.log('    auth.signup: Success for ', newUser);
                    return done(null, newUser);;

                } else {;            
                    // User found
                    console.log('    auth.signup: User Already exists ', user);
                    return done(null, user);;
                };
            });

            // //Send the user information to the next middleware
            // console.log('    auth.signup: Success for ', newUser);
            // return done(null, newUser);;
        } catch (error) {
            console.log('auth.signup: Error: ', error)
            done(error);
        };
    }
));

//Create a passport middleware to handle User login
passport.use('login', new localStrategy(
    {
        usernameField : 'userID',
        passwordField : 'password'
    }, async (userID, password, done) => {
        console.log('auth.use.login starts')
        try 
            {
                console.log('In auth.js LOGIN try block start')

                // Find the user in the DB
                const user = await UserModel.findOne({ userID });

                // Error in interaction with DB
                if( !user ){
                    //If the user isn't found in the database, return a message
                    return done(null, false, { message : 'User not found'});
                };

                // Validate password and make sure it matches with the corresponding hash stored in the DB
                // If the passwords match, it returns a value of true.
                const validate = await user.isValidPassword(password);
                if( !validate ){
                    return done(null, false, { message : 'Wrong Password'});
                };

                //Send the user information to the next middleware
                return done(null, user, { message : 'Logged in Successfully'});
            } 
            catch (error) {
                return done(error);
            };
    })
);

const JWTstrategy = require('passport-jwt').Strategy;
//We use this to extract the JWT sent by the user
const ExtractJWT = require('passport-jwt').ExtractJwt;

//This verifies that the token sent by the user is valid
passport.use(new JWTstrategy({
    //secret we used to sign our JWT
    secretOrKey : 'top_secret',
    //we expect the user to send the token as a query paramater with the name 'secret_token'
    jwtFromRequest : ExtractJWT.fromUrlQueryParameter('secret_token')
}, async (token, done) => 
    {
    console.log('auth.use.jwt-verify starts')
        try {
            console.log('SUCCESS in auth.passport.use', token.userID)
            //Pass the user details to the next middleware
            return done(null, token.userID);
        } catch (error) {
            console.log('Error in auth.passport.use')
            done(error);
        }
    }
));