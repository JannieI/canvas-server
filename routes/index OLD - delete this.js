// Basic imports -----------------------------------------------------------------
var express = require('express');
var router = express.Router();

// Third Party modules -----------------------------------------------------------
// const passport = require('passport');


// Functions ---------------------------------------------------------------------

// Check that data of HTTP message is JSON
function requireJSON(req, res, next) {
    // NB req.is returns false if there is no body !
    if (!req.is('application/json')) {
        return res.json({msg: "Content type must be JSON"})
    } else {
        next();
    };
}


// Get Data ---------------------------------------------------------------------
const canvasBackgroundcolorsDefaults = require('../data/canvasBackgroundcolorsDefaults');


// Runs for ALL routes ----------------------------------------------------------

// For Testing only
// router.use( (req, res, next) => {
//     console.log('req', req);
//     next();
// });

// Get Parameters
router.param(('id'), (reg, res, next) => {
    // Update analytics in db as someone hit this ID
    next();
})

// Check the Query input for /background
router.use((req, res, next) => {
    const searchTerm = req.query.query;
    // console.log(req.originalUrl == '/background')
    if(req.originalUrl == '/background') {
        if (!searchTerm) {
            res.json( {msg: "Search term required"} )
        };
    } else {
        next();
    };
});


// Methods for this Router -----------------------------------------------------------
router.post('/loginLocal', (req, res, next) => {
    console.log('/loginLocal');
    // req.body is made by urlencoded, which parses the http message for sent data!
    const password = req.body.password;
    const username = req.body.username;
    console.log(username);
    console.log(password);
    // res.send('Done ...');
    // check the db to see if user credentials are valid
    // if they are valid...
        // - save their username in a cookie    
        // - is send them to the welcome page
    if(password === "x"){
        // res.cookie takes 2 args:
        // 1. name of the cookie
        // 2. value to set it to 
        res.cookie('username',username)
        // res.redirect takes 1 arg:
        // 1. Where to send the brower
        return res.json({msg: 'Logged in ' + username})
    }else{
        // The "?" is a special character in a URL
        return res.json({msg: 'Login failed'})
    };
})

// logoutLocal
router.get('/logoutLocal', (req, res, next)=>{
    console.log('/logoutLocal');
    // res.clearCookie('username');
    // res.json({msg: ' Logged out'})
    res.send('Done Logout');
})

// loginGitHub
// router.get('/loginGitHub', passport.authenticate('github'));

// router.get('/auth', passport.authenticate('github',{
//     successRedirect: '/',
//     failureRedirect: '/loginFailed'
// }));

// router.get('loginFailed'), (req, res, next) => {
//     res.json({msg: 'Login failed'});
// };

// logoutGitHub
// router.get('/logoutGitHub', (req, res, next) => {
//     req.logout();
//     req.session.destroy( () => {
//         res.clearCookie('connect.sid');
//         res.json( {msg: "Logged out"} );
//     });
// });

// POST / page
router.post('/', (req, res, next) => {
    console.log('I AM in Post ...')
    res.type('html');
    res.send(`<h1> POST Home Page </h1>`);
});

// GET / page
router.get('/', (req, res, next) => {
    console.log('user = ', req.user)
    res.render('index', { title: 'Express' });
});


// Get ALL / SELECTED /background
router.get('/background', (req, res, next) => {
    // Get the page nr to start from the query string
    let pageStartNrRequested = req.query.page;
    let pageSize = 19;    // Is actually 20 since we base 0
    if (pageStartNrRequested == undefined) {
        pageStartNrRequested = 1;   // Make default 1 => rows start at 0
        pageSize = canvasBackgroundcolorsDefaults.length - 1;
    };

    // Define starting position, and extract required data
    const rowStartNr = (pageStartNrRequested - 1) *20;
    const results = canvasBackgroundcolorsDefaults.slice(rowStartNr, rowStartNr + pageSize);

    // Say if no records
    if (!results) {
        res.json({
            rows: 0,
            msg: "No records found"
        });
    } else {
        // Return Data
        return res.json(
            {
                page: pageStartNrRequested,
                rows: pageSize,
                results: results
            }
        );
    };
});

// Get SINGLE /background
// This has to come LAST in .../something
router.get('/background:id', (req, res, next) => {
    // Get the page nr to start from the query string

    const id = req.params.id;
    // Define starting position, and extract required data
    const results = canvasBackgroundcolorsDefaults.filter(row => {
        row.id == Number(id);
    });

    // Say if no records
    if (!results) {
        return res.json({
            rows: 0,
            msg: "Record id " + id + " does not exist."
        });
    } else {
        // Return Record
        return res.json(
            {
                id: id,
                rows: 1,
                results: results
            }
        );
    };
});

// POST /background
router.post('/background', requireJSON, (req, res, next) => {
    const rate = req.body.value;
    if (rate < 10) {
        return res.json( {msg: "Rating must be greater 10"} );
    } else {
        res.status(300);
        return res.json(
            {
                statusCode: 200,
                msg: "Rating updated"
            }
        );
    };
});

// DELETE /background
router.delete('/background', (req, res, next) => {
    res.json(
        {
            statusCode: 200,
            msg: "Rating Deleted !"
        }
    );

});



// Export -----------------------------------------------------------
module.exports = router;
