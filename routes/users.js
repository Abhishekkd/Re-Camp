const express =require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');

//render a form i.e show login form
router.get('/register',(req,res)=>{
    res.render('users/register');
})

//registering a user
router.post('/register',catchAsync(async(req,res)=>{
    try{
    const {email,username,password}=req.body;
    const user = new User({email,username});
    const registeredUser = await User.register(user,password)//takes the entire instance of the user we just made and password which it will hash and salt before storing the result
        req.flash('success','Welcome to Re-Camp!!');
        res.redirect('/campgrounds');
    }catch(e){
        //if there's a problem in registering a user
        req.flash('error',e.message);//this error that we are catching it itself contains an error message
        res.redirect('register');
    }
    // console.log(registeredUser);
    }));

module.exports = router;