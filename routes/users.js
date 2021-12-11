const { Router } = require('express');
const express =require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const users = require('../controllers/users');


//render a form i.e show login form
router.get('/register',
        users.renderRegister);


//registering a user
router.post('/register',
        catchAsync(users.register));


//serve our login form 
router.get('/login',
        users.renderLogin);


//to login
router.post('/login',
         passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),
         users.login); 


//to logout
router.get('/logout',
        users.logout);


module.exports = router;        