const mongoose = require('mongoose');
//to shorten mongoose.schema we're gonna save reference to  it in a variable
const Schema = mongoose.Schema;
const Review = require('./review');

//our schemas

//nesting schema so that we can use virtual property on it
const ImageSchema = new Schema({
    //every image has a url and filename as a string
    url:String,
    filename:String
})
//defining a virtual on every image i wanna setup a thumbnail(a property on each individual element of images array)
ImageSchema.virtual('thumbnail').get(function(){
    //this is referring to a particular image
    return this.url.replace('/upload','/upload/w_200'); //taking the url and adding parameters to it as required by cloudinary api to work
 //replacing contents of api(url) where we are gonna make our request to ge thumbnail
});
//so the virtuals will work after we convert a document to json 
const opts = {toJSON:{virtuals:true}};
const CampgroundSchema = new Schema({
    title:String,
    price:Number,
    images :[ImageSchema],
    //represents geoJson whose type is point and contains an array of coordinates containing latitude and longitude 
    geometry: {
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      },
    description : String,
    location: String,
    //adding owner to a campground sort of associating them
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    //array where we have object-ids of reviews
    reviews:[
        {
            //type set to object id 
            type:Schema.Types.ObjectId,
            //ref set to review model
            ref: 'Review'
        }
    ]
},opts);//passing this to our schema

//registering or defining  a virtual for our campground in a particular format as required by mapbox in order for have popups display our data
//to use this we need to access it using campground.properties.popMarkup
CampgroundSchema.virtual('properties.popUpMarkUp').get(function(){//nesting property inside a property
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>$${this.price}/night<br>${this.description.substring(0,20)}..</p>`
})//this refers to particular campground instance //substring of only first 20 characters

//mongoose query middleware for deleting reviews along with their corresponding campground
//post that is this will run after its been deleted
CampgroundSchema.post('findOneAndDelete', async(doc)=>{
    //doc the thing that was deleted and passed onto our middleware functions
    //taking all of the reviews in the array called reviews inside campground ,take all
    // the ids from that array and delete every review with that matching id 
   
    //if we did find a document i.e something is deleted
    if(doc){
        await Review.deleteMany({
       //this document has review and we're going to basically delete all reviews where their id field in our document that
       //was just deleted,in its reviews array (deleting from our reviews collection(based upon Review model(represents data in db))
       // inside of our re-camp db) 
       _id:{
           $in: doc.reviews
       }
   })
 
}
  
})



//exporting our whole model without saving its reference to a variable
module.exports = mongoose.model("Campground", CampgroundSchema);