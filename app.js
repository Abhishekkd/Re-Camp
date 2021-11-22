 const express = require('express');
 const mongoose = require('mongoose');
 const path = require('path');
 const ejsMate =require('ejs-mate');
 const catchAsync=require('./utils/catchAsync');
 const expressError = require('./utils/ExpressError');
 const methodOverride = require('method-override');
 const Campground= require("./models/campground");
 const ExpressError = require('./utils/ExpressError');

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
app.post('/campgrounds',catchAsync(async(req,res,next)=>{
    if(!req.body.campground) throw new ExpressError('Invalid Campground Data',400);
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
app.put('/campgrounds/:id',catchAsync(async(req,res)=>{
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