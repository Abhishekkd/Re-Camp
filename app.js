 const express = require('express');
 const mongoose = require('mongoose');
 const path = require('path');
 const ejsMate =require('ejs-mate');
  //we're destructuring this schema here as we'll be having multiple schemas here
 const {campgroundSchema,reviewSchema}=require('./schemas.js');
 const catchAsync=require('./utils/catchAsync');
//  const expressError = require('./utils/ExpressError');
 const methodOverride = require('method-override');
 const Campground= require("./models/campground");
 const ExpressError = require('./utils/ExpressError');
//  const campground = require('./models/campground');
 const Review = require('./models/review');
 const campgrounds = require('./routes/campgrounds')

// // database is named farmStand where our collections will be stored and will be created for us
// mongoose.connect('mongodb://localhost:27017/re-camp', { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(()=> {
//         console.log("Mongo connected")
//     })
//     .catch(err =>{
//         console.log("oh fuck error");
//         console.log(err);
//     })

mongoose.connect('mongodb://localhost:27017/re-camp',{
    useNewUrlParser: true, 
    useUnifiedTopology: true
});
 const db = mongoose.connection;
 db.on("error", console.error.bind(console,"connection error:"));
 db.once('open', ()=>{
     console.log("Database Connection")
 })
// executing our required express app
 const app = express();
 
//we need to tell express to use ejs-mate instead of the default engine its relying on
app.engine('ejs', ejsMate);

app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));
//to get data from our post request as by default our res.body is empty so we need to parse it
app.use(express.urlencoded({extended:true}));
//inside we pass in the sting we want to use for our query string i.e _method
app.use(methodOverride('_method'));




//middleware for validating our review data
const validateReview=(req,res,next)=>{
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

//here's where the campground routes were first laid out
//adding on our routes onto routers
app.get('/',(req,res)=>{
    res.render("home");
})

//specify the router we wanna use which is our campgrounds that we required
//passing in path that we want our routes to prefix with
//2->also router we wanna use
app.use('/campgrounds',campgrounds)



//to submit our  reviews data to servers/db
app.post('/campgrounds/:id/reviews',validateReview,catchAsync(async(req,res,next)=>{
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
    res.redirect(`/campgrounds/${campground._id}`);

}))

//for deleting reviews
app.delete('/campgrounds/:id/reviews/:reviewId',catchAsync(async(req,res,next)=>{
   const {id,reviewId} = req.params;
   //so i wanna pull from this reviews array inside of campground where review matches to review id
    await Campground.findByIdAndUpdate(id,{$pull: {reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))


//for paths which aren't their
app.all('*',(req,res,next)=>{
    next(new ExpressError('Page Not Found!!!',404))
})

//error handling middleware
//catch all for any error
app.use((err,req,res,next)=>{
    const {statusCode=500}=err;
    //instead of destructuring message variable ,(which is just updating the variable
    //  and it wont update the message we are passing through to our template-only  applicable when theres no message) 
    res.status(statusCode).render('error',{ err });
})

 app.listen(3000,()=>{
     console.log("Serving u on port 3000")
 })