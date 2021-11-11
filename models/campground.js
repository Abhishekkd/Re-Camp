const mongoose = require('mongoose');
//to shorten mongoose.schema we're gonna save reference to  it in a variable
const Schema = mongoose.Schema;

//our schema
const CampgroundSchema = new Schema({
    title:String,
    price:Number,
    image:String,
    description : String,
    location: String
});

//exporting our whole model without saving its reference to a variable
module.exports = mongoose.model("Campground", CampgroundSchema);