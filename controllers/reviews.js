//our models
const Campground= require("../models/campground");
const Review = require('../models/review');


//to submit our  reviews data to servers/db
module.exports.createReview = async(req,res,next)=>{
    const campground = await Campground.findById(req.params.id);
    //on the form we structured it as we gave each input a name prefixed with review and [body or rating]
    //so our review data is all under the key of review (once its been parsed)
    const review = new Review(req.body.review);
    //next pushing review onto campgrounds,i.e on the campgrounds models we set this review array(where we are pushing onto)
    //which is just bunch of object ids corresponding to a review
    //so pushing our new review
    campground.reviews.push(review);
    //setting owner to a particular review
    review.author = req.user._id;
    // console.log(req.user);
    await review.save();
    await campground.save();//saving campground as well cause we are storing a reference to the review in the campground array called reviews
    // console.log(review);
    req.flash('success','Created new review!!');
    res.redirect(`/campgrounds/${campground._id}`);

}


//for deleting reviews
//isReviewAuthor is here as to make sure that they still cant make delete requests
module.exports.deleteReview = async(req,res,next)=>{
    const {id,reviewId} = req.params;
    //so i wanna pull from this reviews array inside of campground where review matches to review id
     await Campground.findByIdAndUpdate(id,{$pull: {reviews:reviewId}});
     await Review.findByIdAndDelete(reviewId);
     req.flash('success','Successfully deleted Review!!')
     res.redirect(`/campgrounds/${id}`);
 };