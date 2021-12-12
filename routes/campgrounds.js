//campground router contains its routes
const express = require('express');
const router = express.Router();
//campground object that represents our campground controller
const campgrounds = require('../controllers/campgrounds');
const catchAsync=require('../utils/catchAsync');
const Campground= require("../models/campground");
 //authentication and authorization middleware's
 const {isLoggedIn,isAuthor,validateCampground}=require('../authMiddleware');
//for our multer middleware
const multer  = require('multer')
const {storage} =require('../cloudinary')//we dont need to add /index.js here cause node.js by default looks for index.js files
const upload = multer({ storage });//uploads is destination for our uploads but we wanna it to be cloudinary
//telling multer to store things in storage that we just required
router.route('/')
//show route or index
        .get(catchAsync(campgrounds.index))
//submit our post to create a campground
<<<<<<< HEAD
     
=======
        // .post(isLoggedIn,validateCampground,
        // catchAsync(campgrounds.createCampground));
        .post(upload.array('image'),(req,res)=>{ //image is the piece of the form data,the multer will look for and that data is a file
                console.log(req.body,req.files);
                res.send("nice");
                //array-multiple files stored on req.files
                //so multer is just going to parse that form data ,its looking for image here ,and it'll treat that as files
                //and that's what its supposed to be
        })
>>>>>>> proto

//to create a new campground that is then render a form 
router.get('/new',
        isLoggedIn,
        campgrounds.renderNewForm);

router.route('/:id')
//show route or show details
//we'll be using that id to get the corresponding campground
        .get(/*,isLoggedIn*/catchAsync(campgrounds.showCampground))
//to submit our update data of our campground
        .put(
        isLoggedIn,
        isAuthor,
        validateCampground,catchAsync(campgrounds.updateCampground))
//to delete campground
        .delete(
        isLoggedIn,
        isAuthor,
        catchAsync(campgrounds.deleteCampground));

//serves the update form which will be pre-populated
router.get("/:id/edit",
        isLoggedIn,
        isAuthor,
        catchAsync(campgrounds.renderEditForm));





module.exports = router;