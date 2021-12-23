 //not in production i.e currently we are in development phase
 if(process.env.NODE_ENV !== "production"){
     require('dotenv').config();//requiring configured environment variables
 }
//  console.log(process.env.SECRET);

 const express = require('express');
 const mongoose = require('mongoose');
 const path = require('path');
 const ejsMate =require('ejs-mate');

 const session =require('express-session');
 //require it and then later downwards we'll make its instance
 const MongoDBStore = require('connect-mongo');

 const flash = require('connect-flash');
 const mongoSanitize = require('express-mongo-sanitize');
  //we're destructuring this schema here as we'll be having multiple schemas here
 const {campgroundSchema,reviewSchema}=require('./schemas.js');
//  const catchAsync=require('./utils/catchAsync');
 const methodOverride = require('method-override');
 const Campground= require("./models/campground");
 const ExpressError = require('./utils/ExpressError');
 const Review = require('./models/review');
 const passport=require('passport');
 const LocalStrategy = require('passport-local');
 const User = require('./models/user')
 //helmet for security
 const helmet = require('helmet');

 const campgroundRoutes = require('./routes/campgrounds')
 const reviewRoutes = require('./routes/reviews');
 const userRoutes = require('./routes/users');
 const { dangerouslyDisableDefaultSrc } = require('helmet/dist/middlewares/content-security-policy');
 const { func } = require('joi');

 const dbUrl = process.env.DB_URL||'mongodb://localhost:27017/re-camp';//this will be like a backup
 const secret = process.env.SECRET || 'thisShouldBeAnActualSecretInProduction';
// database is named farmStand where our collections will be stored and will be created for us
// mongoose.connect('mongodb://localhost:27017/re-camp', { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(()=> {
//         console.log("Mongo connected")
//     })
//     .catch(err =>{
//         console.log("oh fuck error");
//         console.log(err);
//     })
//connecting to database
mongoose.connect(dbUrl,{
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    // useFindAndModify:false,
    // useCreateIndex:true
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

//configuration for our app
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//middleware's

//to get data from our post request as by default our res.body is empty so we need to parse it
app.use(express.urlencoded({extended:true}));
//inside we pass in the sting we want to use for our query string i.e _method
app.use(methodOverride('_method'));

//telling express to serve our public directory i.e containing static files
// app.use(express.static('public'));
//joining our current working direct absolute path with public directory
//so we can run our file from inside of that directory too
app.use(express.static(path.join(__dirname,'public')));
//middleware for our sanitizer
app.use(mongoSanitize({
    replaceWith:'_' //to replace characters with underscore after sanitizing
}));

//configuring sessions to be stored in mongodb (mongoStore for the session)
const store= MongoDBStore.create({
    mongoUrl:dbUrl,
  crypto:{
      secret
    },
//so data will be updated when necessary and not continuous savings and if the data is same then it wont be updated 
    touchAfter:24*60*60
});
store.on("error",function(e){
    console.log("Session Store Error",e)
});
//for sessions to be stored locally using passport
// adding in some configuring object that doesn't exist yet
const sessionConfig={
    store,
    //default name of our session (or cookie) is connect.sid and we're changing that
    //change it to something less obvious which makes it seem less of a cookie,so hecker can't extract from user and use it
    name:'session',
    secret,
    //setting some options for session otherwise we'll get deprecation error
    resave : false,
    saveUninitialized: true,
    // later on our data store will be mongo,currently its just memory (it juz goes away)
    cookie:{
      //week for it to expire
    expires:Date.now() + 1000*60*60*24*7,
    maxAge:1000*60*60*24*7,
    //juz extra security added on sessionConfig object
    //this basically says that our cookies at least the one set through the sessions,are only accessible over Http
    //, they're not accessible through js
    httpOnly:true,
    //this means this should only work over https (s for secure) and localhost isn't https i.e its not secure so its gonna break things
    //so that our site or rather our cookies can only be configured or changed over secure connection (https)
    //? secure:true
    }
    
}
//telling our app to use these things
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());//this enables us to use all 11 helmet middleware's
//src that we allowed to load data from {sources we are allowing for content security policy}
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.jsdelivr.net/npm/@popperjs/core@2.10.2/dist/umd/popper.min.js",
     "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.min.js",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
     "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = ["https://fonts.gstatic.com/s/roboto/v29/KFOlCnqEu92Fr1MmEU9fBBc4.woff2"];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/doyl9cutp/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

//passport thingy's

app.use(passport.initialize());
//middleware if we need persistent login sessions and its alternative would be to login on every single request,which is something you'd often 
//do when u are using api's but not as a user with  an  actual interface 
app.use(passport.session());
//passing in our user model
//this is saying that passport use the localStrategy that we have required or we can also use some other strategy
// and for that localStrategy the authenticate method(by passport) on user model
//static method added in automatically like authenticate() on our model by passport-local-mongoose
passport.use(new LocalStrategy(User.authenticate())) //specifying authentication method

//these next two methods have been added in thanks to our plugin

//this is telling passport how to serialize a user and serialization refers to how do we store a user in session
passport.serializeUser(User.serializeUser());
//how do u get user out of that session or un-store or remove a user from a session
passport.deserializeUser(User.deserializeUser());


//middleware for our flash
//we have access to this on every single template as these are global things
app.use((req,res,next)=>{
    // console.log(req.query);
    //so whatever is in there i.e message for now
    //so on every single request whatever  is in this flash under success
    // we'll have access to it under the locals in the key success
   res.locals.success = req.flash('success');
   //if there's anything in the flash under error
   res.locals.error = req.flash('error');
   res.locals.currentUser = req.user;//gives info about the user currently logged in
//    console.log(req.session);
   next();
})

//here's where the campground routes were first laid out
//adding on our routes onto routers
app.get('/',(req,res)=>{
    res.render("home");
})

//?fake user registration

// app.get('/secret',async(req,res)=>{
//     const user = new User({email: 'deepend@gmail.com',username:'nugget'});
//     const newUser = await User.register(user,'chicken');//providing a user object(instance of our model) and then password
//     //then it takes care of hashing and salting and all that
//     res.send(newUser);
// })


//specify the router we wanna use which is our campgrounds that we required
//passing in path that we want our routes to prefix with
//2->also router we wanna use
app.use('/campgrounds', campgroundRoutes)
//reviews router
app.use('/campgrounds/:id/reviews', reviewRoutes);
//users router
app.use('/', userRoutes);


//for paths which aren't their
app.all('*',(req,res,next)=>{
    next(new ExpressError('Page Not Found!!!',404))
})

//*error handling middleware
//catch all for any error
app.use((err,req,res,next)=>{
    const {statusCode=500}=err;
    //instead of destructuring message variable ,(which is just updating the variable
    //  and it wont update the message we are passing through to our template-only  applicable when theres no message) 
    res.status(statusCode).render('error',{ err });
})
//specified port for heroku
const port = process.env.PORT || 3000 //that will be present automatically on heroku (port variable)
// and set to something and if we are in development phase i.e localhost just default to 3000
 app.listen(port,()=>{
     console.log(`Listening on ${port}` )
 }) 