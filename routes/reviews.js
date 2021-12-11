//reviews router contains its routes
const express = require('express');
//merging parameters(id) on from campground to reviews routes so we have access to ids here in review routes
const router = express.Router({mergeParams:true});
//our models
const Campground= require("../models/campground");
const Review = require('../models/review');
//middleware's
const {validateReview} = require('../authMiddleware');


const ExpressError = require('../utils/ExpressError');
const catchAsync=require('../utils/catchAsync');





//to submit our  reviews data to servers/db
router.post('/',validateReview,catchAsync(async(req,res,next)=>{
    const campground = await Campground.findById(req.params.id);
    //on the form we structured it as we gave each input a name prefixed with review and [body or rating]
    //so our review data is all under the key of review (once its been parsed)
    const review = new Review(req.body.review);
    //next pushing review onto campgrounds,i.e on the campgrounds models we set this review array(where we are pushing onto)
    //which is just bunch of object ids corresponding to a review
    //so pushing our new review
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    // console.log(review);
    req.flash('success','Created new review!!');
    res.redirect(`/campgrounds/${campground._id}`);

}))

//for deleting reviews
router.delete('/:reviewId',catchAsync(async(req,res,next)=>{
   const {id,reviewId} = req.params;
   //so i wanna pull from this reviews array inside of campground where review matches to review id
    await Campground.findByIdAndUpdate(id,{$pull: {reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','Successfully deleted Review!!')
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;