//reviews router contains its routes
const express = require('express');
//merging parameters(id) on from campground to reviews routes so we have access to ids here in review routes
const router = express.Router({mergeParams:true});
//our models
const Campground= require("../models/campground");
const Review = require('../models/review');
//middleware's
const {validateReview,isLoggedIn,isReviewAuthor} = require('../authMiddleware');
//controller
const reviews = require('../controllers/reviews')

const ExpressError = require('../utils/ExpressError');
const catchAsync=require('../utils/catchAsync');





//to submit our  reviews data to servers/db
router.post('/',isLoggedIn,validateReview,catchAsync(reviews.createReview));

//for deleting reviews
//isReviewAuthor is here as to make sure that they still cant make delete requests
router.delete('/:reviewId',isLoggedIn,isReviewAuthor,catchAsync(async(req,res,next)=>{
   const {id,reviewId} = req.params;
   //so i wanna pull from this reviews array inside of campground where review matches to review id
    await Campground.findByIdAndUpdate(id,{$pull: {reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','Successfully deleted Review!!')
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;