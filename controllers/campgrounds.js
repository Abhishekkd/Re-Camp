//our show campground logic
const Campground= require("../models/campground");

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
    //taking data from req.body.campground and submit & saving that to make our new campground

    const campground = new Campground(req.body.campground);
    //to add owner to the currently created campground
       campground.author = req.user._id; //so taking th user id and saving it as an author on this newly made campground 
       await campground.save();
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