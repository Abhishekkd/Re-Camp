 const express = require('express');
 const mongoose = require('mongoose');
 const path = require('path');
 const ejsMate =require('ejs-mate');
  //we're destructuring this schema here as we'll be having multiple schemas here
 const {campgroundSchema}=require('./schemas.js');
 const catchAsync=require('./utils/catchAsync');
 const expressError = require('./utils/ExpressError');
 const methodOverride = require('method-override');
 const Campground= require("./models/campground");
 const ExpressError = require('./utils/ExpressError');
//  const campground = require('./models/campground');
 const Review = require('./models/review')

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

//defining a middleware function called validateCampground
const validateCampground = (req,res,next)=>{
     //passing our data through to our schema(campgroundSchema) to make sure everything in there
    const {error} = campgroundSchema.validate(req.body);
    // doing something is we encounter an error
    if(error){
        //if theres an error throw new expressError ,it will be caught and passed to our error handler
        //if theres an error we'll map over error.details array and turn it into string and join it together
        //inside arg for each element im just going to return the message and join them together with a comma if theres more than one message

        const msg = error.details.map(el=>el.message).join(',');
        throw new ExpressError(msg,400);
    }else{
        //that is if there isn't any error move on to next matching route handler
        next();
    }
}


app.get('/',(req,res)=>{
    res.render("home");
})
//show route or index
app.get('/campgrounds',async(req,res)=>{
    // making a new campground based upon our Campground model
    //finding all campgrounds that are seeding to our database which were made using campground models in our index.js(inside loop)
 const campgrounds = await Campground.find({});
 //we'll be structuring our templates in different folder
 res.render('campgrounds/index',{campgrounds});
})
//to create a new campground that is then render a form 
app.get('/campgrounds/new',(req,res)=>{
    res.render('campgrounds/new')
})

//submit our post
//taking data from req.body.campground and submit & saving that to make our new campground
app.post('/campgrounds',validateCampground,catchAsync(async(req,res,next)=>{
 const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)     
}))


//show route or show details
//we'll be using that id to get the corresponding campground
app.get('/campgrounds/:id',catchAsync(async(req,res,next)=>{
    const campground = await Campground.findById(req.params.id);// or const {id} = req.params; then we pass in that id directly to findById
    res.render('campgrounds/show',{campground});
}));
//serves the update form which will be pre-populated
app.get("/campgrounds/:id/edit",catchAsync(async (req,res,next)=>{
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit',{campground});
}));
//to submit our update data of our campground
app.put('/campgrounds/:id',validateCampground,catchAsync(async(req,res)=>{
    const {id} = req.params;
    //1st arg toFind and 2nd arg data to update with i.e title,price,location,etc
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground});//here spreading out campground object 
    //into this 2nd argument object which contains
    // our new campground to be updated data i.e title and location under campground and can be found under req.body.campgrounds 
    //redirecting to our show page of the campground we just updated
    res.redirect(`/campgrounds/${campground._id}`)
}))
//to delete campground
app.delete('/campgrounds/:id',catchAsync(async(req,res,next)=>{
    //find using id and then delete
    const {id} =req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))


//to submit our  reviews data to servers/db
app.post('/campgrounds/:id/reviews',catchAsync(async(req,res,next)=>{
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
    console.log(review);
    res.redirect(`/campgrounds/${campground._id}`);

}))

//for paths which aren't their
app.all('*',(req,res,next)=>{
    next(new expressError('Page Not Found!!!',404))
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