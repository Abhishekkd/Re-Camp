 const express = require('express');
 const mongoose = require('mongoose');
 const path = require('path');
 const ejsMate =require('ejs-mate');
  //we're destructuring this schema here as we'll be having multiple schemas here
 const {campgroundSchema,reviewSchema}=require('./schemas.js');
//  const catchAsync=require('./utils/catchAsync');
 const methodOverride = require('method-override');
 const Campground= require("./models/campground");
 const ExpressError = require('./utils/ExpressError');
 const Review = require('./models/review');
 const campgrounds = require('./routes/campgrounds')
 const reviews = require('./routes/reviews');

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






//here's where the campground routes were first laid out
//adding on our routes onto routers
app.get('/',(req,res)=>{
    res.render("home");
})

//specify the router we wanna use which is our campgrounds that we required
//passing in path that we want our routes to prefix with
//2->also router we wanna use
app.use('/campgrounds',campgrounds)
//reviews router
app.use('/campgrounds/:id/reviews',reviews);

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