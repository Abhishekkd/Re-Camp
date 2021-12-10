const { Router } = require('express');
const express =require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');

//render a form i.e show login form
router.get('/register',(req,res)=>{
    res.render('users/register');
})

//registering a user
router.post('/register',catchAsync(async(req,res,next)=>{
    try{
    const {email,username,password}=req.body;
    const user = new User({email,username});
    const registeredUser = await User.register(user,password)//takes the entire instance of the user we just made and password which it will hash and salt before storing the result
     //for actually logging in the user
        req.login(registeredUser,err=>{ //no await,so had to pass in this callback there wasn't any other choice
            if(err) return next(err);
            req.flash('success','Welcome to Re-Camp!!');
        res.redirect('/campgrounds');
        })
    }catch(e){
        //if there's a problem in registering a user
        req.flash('error',e.message);//this error that we are catching it itself contains an error message
        res.redirect('register');
    }
    // console.log(registeredUser);
    }));
//serve our login form 
router.get('/login',(req,res)=>{
    res.render('users/login');
})
//to login
router.post('/login', passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),(req,res)=>{
    //making into this route means successfully logging in
    req.flash('success',"Welcome back!");
    //for continuing from where they left off before logging in
    const redirectUrl =req.session.returnTo || '/campgrounds'; //if their is nothing in returnTo i.e directly going to login page 
    delete req.session.returnTo;//so theres nothing now in the session returnTo i.e if i refresh ->logout ->then same procedure
    res.redirect(redirectUrl);
}
); 

router.get('/logout',(req,res)=>{
    req.logout();
    req.flash('success',"Successfully Logged u out!!")
    res.redirect('/campgrounds');
})

module.exports = router;