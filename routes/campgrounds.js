//campground router contains its routes
const express = require('express');
const router = express.Router();
//campground object that represents our campground controller
const campgrounds = require('../controllers/campgrounds');
const catchAsync=require('../utils/catchAsync');
const Campground= require("../models/campground");
 //authentication and authorization middleware's
 const {isLoggedIn,isAuthor,validateCampground}=require('../authMiddleware');



//show route or index
router.get('/',catchAsync(campgrounds.index));

//to create a new campground that is then render a form 
router.get('/new',isLoggedIn,campgrounds.renderNewForm);

//submit our post to create a campground
router.post('/',isLoggedIn,validateCampground,catchAsync(campgrounds.createCampground));


//show route or show details
//we'll be using that id to get the corresponding campground
router.get('/:id'/*,isLoggedIn*/,catchAsync(campgrounds.showCampground));

//serves the update form which will be pre-populated
router.get("/:id/edit",isLoggedIn,isAuthor,catchAsync(async (req,res,next)=>{
    //we could just get away with just doing isAuthor but idLoggedIn allows us to provide more specific feedback
    const campground = await Campground.findById(req.params.id);
    //trying to edit an campground that doesn't exist
    if(!campground){ //this just to make sure there si a campground that we found
        //if error ie no campground found redirect to index page
        //otherwise redirect and redirect normally 
        req.flash('error','Cannot find requested Campground!!');
        return res.redirect('/campgrounds');
    }//then if there is a campground then we check to see if u own it
     //permissions
    //  // only editing campgrounds that are allowed
    //  if(!campground.author.equals(req.user._id)){
    //     //if the id is same then only we'll let u update the campground otherwise error
    //     req.flash('error','Not Allowed!!!')
    //    return  res.redirect(`/campgrounds/${req.params.id}`)

    
   
    res.render('campgrounds/edit',{campground});
}));

//to submit our update data of our campground
router.put('/:id',isLoggedIn,isAuthor,validateCampground,catchAsync(async(req,res)=>{
    const {id} = req.params;
    //1st arg toFind and 2nd arg data to update with i.e title,price,location,etc
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground});//here spreading out campground object 
    //into this 2nd argument object which contains
    // our new campground to be updated data i.e title and location under campground and can be found under req.body.campgrounds 
    //redirecting to our show page of the campground we just updated
    req.flash('success','Successfully updated campground!!')
    res.redirect(`/campgrounds/${campground._id}`)
}))
//to delete campground
router.delete('/:id',isLoggedIn,isAuthor,catchAsync(async(req,res,next)=>{
    //find using id and then delete
    const {id} =req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','Successfully deleted Campground!!' )
    res.redirect('/campgrounds');
}))

module.exports = router;