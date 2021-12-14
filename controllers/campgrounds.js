//our show campground logic
const Campground= require("../models/campground");
//requiring cloudinary that we are exporting from cloudinary
const {cloudinary} = require("../cloudinary");
//importing what we need from mapBox
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
// passing our token
const mapBoxToken = process.env.MAPBOX_TOKEN;
//passing that token when we are instantiating a new geocoding instance
const geocoder= mbxGeocoding({accessToken:mapBoxToken});//geocoder contains two methods that we want that is forward and reverse geocoding

module.exports.index = async(req,res)=>{
    // making a new campground based upon our Campground model
    //finding all campgrounds that are seeding to our database which were made using campground models in our index.js(inside loop)
 const campgrounds = await Campground.find({});
//  console.log(req.user);

 res.render('campgrounds/index',{campgrounds});
}


//show edit form
module.exports.renderNewForm = (req,res)=>{
    res.render('campgrounds/new')
    }
//post route to create a new campgrounds
module.exports.createCampground = async(req,res,next)=>{
    const geoData=await geocoder.forwardGeocode({
        query:req.body.campground.location,//as we nested all of our form fields under campground in their name,so location is in it
        limit:1
    }).send()
//taking data from req.body.campground and submit & saving that to make our new campground
    const campground = new Campground(req.body.campground);
    //if wrong location is given i.e geometry undefined
    if(!geoData.body.features[0].geometry){
        req.flash('error',"NO! Such location is there!!")

    }
    //Adding in our geoJson to campgrounds coming from geoCoding Api
    campground.geometry = geoData.body.features[0].geometry;
//map over those files and for each one of them and for each one of them we want to take the path or url
// and the file name and add them into campground
    campground.images = req.files.map(f=>({url:f.path,filename:f.filename})) //i.e just taking the path and filename o make a new array (4images=4elements)
//for each element of files map over and return an array containing object of containing path and filename

    //to add owner to the currently created campground
    //setting author to be currently logged in author
       campground.author = req.user._id; //so taking th user id and saving it as an author on this newly made campground 
       await campground.save();
    //    console.log(campground);
       //after saving data we'll flash the  message and then redirect
       req.flash('success', 'Successfully made a new Campground!!');
       res.redirect(`/campgrounds/${campground._id}`)     
   }


 //show route or show details
//we'll be using that id to get the corresponding campground
module.exports.showCampground=async(req,res,next)=>{
    const campground = await Campground.findById(req.params.id).populate({//providing in here an object  
      path:'reviews',populate:{ //first populating campgrounds with reviews and then on each of those reviews populating their author 
            path:'author'
        }
    }).populate('author');// or const {id} = req.params; then we pass in that id directly to findById
    // console.log(campground);
    //as we are redirecting to here after creating a campground then to flash the message or display it we need to pass that through
    //so that our template have access to that info
    if(!campground){
        //if error ie no campground found redirect to index page
        //otherwise redirect and redirect normally 
        req.flash('error','Cannot find requested Campground!!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show',{campground});
};


//serves the update form which will be pre-populated
module.exports.renderEditForm = async (req,res,next)=>{
    //we could just get away with just doing isAuthor but idLoggedIn allows us to provide more specific feedback
    const campground = await Campground.findById(req.params.id);
    //trying to edit an campground that doesn't exist
    if(!campground){ //this just to make sure there si a campground that we found
        //if error ie no campground found redirect to index page
        //otherwise redirect and redirect normally 
        req.flash('error','Cannot find requested Campground!!');
        return res.redirect('/campgrounds');
    }//then if there is a campground then we check to see if u own it
     //permissions
    //  // only editing campgrounds that are allowed
    //  if(!campground.author.equals(req.user._id)){
    //     //if the id is same then only we'll let u update the campground otherwise error
    //     req.flash('error','Not Allowed!!!')
    //    return  res.redirect(`/campgrounds/${req.params.id}`)
     res.render('campgrounds/edit',{campground});
};


//to submit our update data of our campground
module.exports.updateCampground = async(req,res)=>{
    const {id} = req.params;
    // console.log(req.body);
    //1st arg toFind and 2nd arg data to update with i.e title,price,location,etc
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground});//here spreading out campground object 
    //into this 2nd argument object which contains
    // our new campground to be updated data i.e title and location under campground and can be found under req.body.campgrounds
    const imgs = req.files.map(f=>({url:f.path,filename:f.filename}));
    campground.images.push(...imgs);//imgs is array and we are taking data from that array and pushing it into our existing images array
    //directly pushing onto campground images would have made array of arrays but we want array of object
    await campground.save();
    //if there are any images to delete
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            //for each filename inside of deleteImages Array well delete from cloudinary
            await cloudinary.uploader.destroy(filename);
        }
    //deleting images from the campground array that matches the data coming from deleteImages array containing filename and we'll
    //delete the images that matches that filename from in campground images array
    await campground.updateOne({$pull:{images:{filename:{$in:req.body.deleteImages}}}});
    //$ pull operator to pull elements(images) out of an array where the filename in each in each array matches to that filename in deleteImages array
    }
   
    //redirecting to our show page of the campground we just updated
    req.flash('success','Successfully updated campground!!')
    res.redirect(`/campgrounds/${campground._id}`)
}


//to delete campground
module.exports.deleteCampground = async(req,res,next)=>{
    //find using id and then delete
    const {id} =req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','Successfully deleted Campground!!' )
    res.redirect('/campgrounds');
}