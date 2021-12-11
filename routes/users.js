const { Router } = require('express');
const express =require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const users = require('../controllers/users');


router.route('/register')
//render a form i.e show login form
        .get(users.renderRegister)
//registering a user
        .post(catchAsync(users.register));

        
router.route('/login')
    //serve our login form 
        .get(users.renderLogin)
    //to login
         .post( passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),users.login); 


//to logout
router.get('/logout',users.logout);


module.exports = router;        