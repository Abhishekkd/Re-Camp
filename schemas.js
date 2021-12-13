//this is not same as our model(js class made using mongoose that represent information in some collection inside of mongo database )
//this is some validation we're using we're employing before we even insert something or update something 

const Joi=require('joi');


    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data',400);
    //defining our basic schema(not mongoose schema so this is going to validate our data even before we  attempt to save it with mongoose
    //i.e even before we involve mongoose at all
    //pass in different things we are looking for inside our req.body.campground
    //i.e expecting campground as key(as everything is sent under campground)

    //so we're redefining it every single time its called
     module.exports.campgroundSchema = Joi.object({
        //this campground is supposed to be an object and its should be there (required)
        campground:Joi.object({
            //here pass in different keys that are nested under campground 
            title:Joi.string().required(),
            price:Joi.number().required().min(0),
            // image:Joi.string().required(),
            location:Joi.string().required(),
            description:Joi.string().required()
        }).required(),
        //its not required when validating and
        // its an array so when we edit/delete images from existing campground we wont be getting error "deleteImages not allowed"
        //deleteImages is an array containing things we checked on checkbox while deleting existing  images from campground
        deleteImages:Joi.array()
    })

//review validations for before submitting it to our db
module.exports.reviewSchema= Joi.object({
    //review an object has rating and body as keys and they are number and string
    review: Joi.object({
        rating:Joi.number().required().min(1).max(5),
        body:Joi.string().required()
    }).required()
})