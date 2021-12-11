const {campgroundSchema,reviewSchema}=require('./schemas');//joi joi js object schema and thats just validating data from req.body
const ExpressError = require('./utils/ExpressError');
const Campground= require('./models/campground');
const Review = require('./models/review')
//reviews
// //joi schema not mongoose
// const {reviewSchema}=require('../schemas.js');

module.exports.isLoggedIn = (req,res,next)=>{
//    /*for a given user here it contains _id,email and username*/ console.log("User->",req.user)
//    //contains deserialized info from the session about the user(meth from passport);
//     //i.e session contains serialized info passport gonna deserialized it the and fill in req.user with that data


 //for things can only be accessible if u're logged in
 if(!req.isAuthenticated()){//this method from passport
    //so as to resume the page from where user left off before  logging in
    req.session.returnTo=req.originalUrl;//we can add in whatever we want in session
    req.flash('error',"you aren't signed in!")
    res.redirect('/login');//or return from here
    }else{
            //if authenticated  call next
        next();
    }
}
//middleware for validating the data that was sent
//defining a middleware function called validateCampground
module.exports.validateCampground = (req,res,next)=>{
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
module.exports.isAuthor = async(req,res,next)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    //permissions
    if(!campground.author.equals(req.user._id)){
        //if the id is same then only we'll let u update or edit or delete the campground otherwise error
        req.flash('error','Not Allowed!!!')
       return  res.redirect(`/campgrounds/${id}`)

    }
    //next() if user does have permissions to change the campground
    next();
}

//for reviews
//middleware for validating our review data
module.exports.validateReview=(req,res,next)=>{
    //hopefully theres a review with rating and body otherwise throw error
    const {error} =reviewSchema.validate(req.body);
    if(error){
        //error.details an array and were mapping over each of its element and joining it
        const msg = error.details.map(el=>el.message).join(',');
        throw new ExpressError(msg,400);
    }else{
        next();
    }

}

module.exports.isReviewAuthor = async(req,res,next)=>{
    const {id,reviewId} = req.params; // from route "/:reviewId"
    const review = await Review.findById(reviewId);
    //permissions
    if(!review.author.equals(req.user._id)){
        //if the id is same then only we'll let u update or edit or delete the campground otherwise error
        req.flash('error','Not Allowed!!!')
       return  res.redirect(`/campgrounds/${id}`)

    }
    //next() if user does have permissions to change the campground
    next();
}
