//campground router contains its routes
const express = require('express');
const router = express.Router();
const ExpressError = require('../utils/ExpressError');
const catchAsync=require('../utils/catchAsync');
const Campground= require("../models/campground");
//.. refers to going back a level then into models or utils directory
 //we're destructuring this schema here as we'll be having multiple schemas here
 const {campgroundSchema,reviewSchema}=require('../schemas.js');

//defining a middleware function called validateCampground
const validateCampground = (req,res,next)=>{
    //passing our data through to our schema(campgroundSchema) to make sure everything in there
   const {error} = campgroundSchema.validate(req.body);
   // doing something is we encounter an error
   if(error){
       //if theres an error throw new expressError ,it will be caught and passed to our error handler
       //if theres an error we'll map over error.details array and turn it into string and join it together
       //inside arg for each element im just going to return the message and join them together with a comma
       // if theres more than one message
       //this error object is automatically made by js or express if theirs an error

       const msg = error.details.map(el=>el.message).join(',');
       throw new ExpressError(msg,400);
   }else{
       //that is if there isn't any error move on to next matching route handler
       next();
   }
}


//show route or index
router.get('/',async(req,res)=>{
    // making a new campground based upon our Campground model
    //finding all campgrounds that are seeding to our database which were made using campground models in our index.js(inside loop)
 const campgrounds = await Campground.find({});
 //we'll be structuring our templates in different folder
 res.render('campgrounds/index',{campgrounds});
})

//to create a new campground that is then render a form 
router.get('/new',(req,res)=>{
    res.render('campgrounds/new')
})

//submit our post
//taking data from req.body.campground and submit & saving that to make our new campground
router.post('/',validateCampground,catchAsync(async(req,res,next)=>{
 const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)     
}))


//show route or show details
//we'll be using that id to get the corresponding campground
router.get('/:id',catchAsync(async(req,res,next)=>{
    const campground = await Campground.findById(req.params.id).populate('reviews');// or const {id} = req.params; then we pass in that id directly to findById
    // console.log(campground);
    res.render('campgrounds/show',{campground});
}));

//serves the update form which will be pre-populated
router.get("/:id/edit",catchAsync(async (req,res,next)=>{
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit',{campground});
}));

//to submit our update data of our campground
router.put('/:id',validateCampground,catchAsync(async(req,res)=>{
    const {id} = req.params;
    //1st arg toFind and 2nd arg data to update with i.e title,price,location,etc
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground});//here spreading out campground object 
    //into this 2nd argument object which contains
    // our new campground to be updated data i.e title and location under campground and can be found under req.body.campgrounds 
    //redirecting to our show page of the campground we just updated
    res.redirect(`/campgrounds/${campground._id}`)
}))
//to delete campground
router.delete('/:id',catchAsync(async(req,res,next)=>{
    //find using id and then delete
    const {id} =req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

module.exports = router;