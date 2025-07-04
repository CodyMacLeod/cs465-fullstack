const express = require('express'); // Express app
const router = express.Router();  // Router logic
const jwt = require('jsonwebtoken'); // Enable JSON Web tokens
/*const jwt = require("express-jwt");
const auth = jwt({
    secret: process.env.JWT_SECRET,
    userProperty:  'payload',
    algorithms: ["HS256"]
});*/

// Method to authenticate our JWT
function authenticateJWT(req, res, next) {
    //console.log('In Middleware');

    const authHeader = req.headers['authorization'];
    //constole.log('Auth Header: ' + authHeader);

    if (authHeader == null) {
        console.log('Auth Header Required but NOT PRESENT!');
        return res.sendStatus(401);
    }

    let headers = authHeader.split(' ');
    if(headers.length < 1){
        console.log('Not enough tokens in Auth Header: ' + headers.length);
        return res.sendStatus(501);
    }

    const token = authHeader.split(' ')[1];
    //console.log('Token: ' + token);
    
    if (token == null) {
        console.log('Null Bearer Token');
        return res.sendStatus(401);
    }

    //console.log(process.env.JWT_SECRET);
    //console.log(jwt.decode(token));
    const verified = jwt.verify(token, process.env.JWT_SECRET, (err, verified) => {
        if(err) {
            return res.sendStatus(401).json('Token Validation Error!');
        }
        req.auth = verified; // Set the auth param to the decoded object
    });
    next(); // We need to continue or this will hang forever
}

// This is where we importr the controllers we will route
const authController = require('../controllers/authentication');
const tripsController = require('../controllers/trips');

// define route for register endpoint
router
    .route('/register')
    .post(authController.register);

// define route for our login endpoint
router
    .route('/login')
    .post(authController.login);

// define route for our trips endpoint
router
    .route('/trips')
    .get(tripsController.tripsList) // GET method routers
    //.post(auth, tripsController.tripsAddTrip); // POST Method adds a trip
    .post(authenticateJWT, tripsController.tripsAddTrip); // POST Method adds a trip

// GET Method routes tripsFindByCode - requires parameter
router
    .route('/trips/:tripCode')
    .get(tripsController.tripsFindByCode)
    //.put(auth, tripsController.tripsUpdateTrip);
    .put(authenticateJWT, tripsController.tripsUpdateTrip);

module.exports = router;