//campground router contains its routes
const express = require('express');
const router = express.Router();
//campground object that represents our campground controller
const campgrounds = require('../controllers/campgrounds');
const catchAsync=require('../utils/catchAsync');
const Campground= require("../models/campground");
 //authentication and authorization middleware's
 const {isLoggedIn,isAuthor,validateCampground}=require('../authMiddleware');



//show route or index
router.get('/',
        catchAsync(campgrounds.index));

//to create a new campground that is then render a form 
router.get('/new',
        isLoggedIn,
        campgrounds.renderNewForm);

//submit our post to create a campground
router.post('/',
        isLoggedIn,
        validateCampground,
        catchAsync(campgrounds.createCampground));


//show route or show details
//we'll be using that id to get the corresponding campground
router.get('/:id'/*,isLoggedIn*/,
        catchAsync(campgrounds.showCampground));

//serves the update form which will be pre-populated
router.get("/:id/edit",
        isLoggedIn,
        isAuthor,
        catchAsync(campgrounds.renderEditForm));

//to submit our update data of our campground
router.put('/:id',
        isLoggedIn,
        isAuthor,
        validateCampground,catchAsync(campgrounds.updateCampground));

//to delete campground
router.delete('/:id',
        isLoggedIn,
        isAuthor,
        catchAsync(campgrounds.deleteCampground));

module.exports = router;