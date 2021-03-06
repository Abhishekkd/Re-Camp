//when reseeding campground we aren't deleting users but only campground stuff
//in here we are going to write our actual seed logic
//im going to make this file self contained so its going to connect to mongoose and its gong to use my model
//so were going to run this file on its own separately from our node at any time we need to seed out database
//which is not often its really just anytime we make changes to the model or to our data 
const mongoose = require('mongoose');
 const Campground= require("../models/campground")
 const cities = require("./cities")
 const {places,descriptors} = require('./seedHelpers')
  require('dotenv').config();
const dbUrl = process.env.DB_URL||'mongodb://localhost:27017/re-camp';
// // database is named re-camp where our collections will be stored and will be created for us
// mongoose.connect('mongodb://localhost:27017/re-camp', { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(()=> {
//         console.log("Mongo connected")
//     })
//     .catch(err =>{
//         console.log("oh fuck error");
//         console.log(err);
//     })

mongoose.connect(dbUrl,{
    useNewUrlParser: true, 
    useUnifiedTopology: true
});
 const db = mongoose.connection;
 db.on("error", console.error.bind(console,"connection error:"));
 db.once('open', ()=>{
     console.log("Database Connection")
 });

 // in this function we pass in an array and this function returns a random element of our array
 // i.e returns the result of array[Math.floor(Math.random()*array.length)]
 const sample = array => array[Math.floor(Math.random()*array.length)];

 //deleting existing data
 const seedDB = async ()=>{
    await Campground.deleteMany({});
//     //just to make sure we are able to connect to our database successfully
//     const c = new Campground({title:'blossoming fields'})
//     await c.save();

//in here we are going to pick a random number use that to pick a city
    for(let i= 0;i<350;i++){
        const random1000 = Math.floor(Math.random() * 1000);
        //making new campground each loop through then saving it in a variable thereafter which  to our database
        const price = Math.floor(Math.random()*20)+10;
        const camp = new Campground({
            //setting all the campgrounds to have author of that id
            //i.e my author id i.e default (chicken:nugget)
            author: "61b0df450ce3370ba40f56f6",
            //city[random1000]->this refers to city being an array from cities.js and we are accessing
            // its elements(an object) using random1000 function on which we are accessing its city property
            location:`${cities[random1000].city}, ${cities[random1000].state}`,
            //this should give combination of our two array in seedHelpers.js
            title : `${sample(descriptors)} ${sample(places)}`,
            description:'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Velit, quaerat voluptates accusamus ea aut praesentium consequuntur corrupti nobis eligendi doloremque, ullam assumenda excepturi numquam reprehenderit quia minima, maxime architecto inventore!'
            ,price,
            geometry :
             { "type" : "Point",
              "coordinates" : [ 
                //taking random coordinates from this massive array we required
                cities[random1000].longitude,
                cities[random1000].latitude,
               ]
            }, 
            images: [
                 {
                  url: 'https://res.cloudinary.com/doyl9cutp/image/upload/v1639329881/ReCamp/bvcrj58rqaz1czgbfkwz.jpg',
                  filename: 'ReCamp/bvcrj58rqaz1czgbfkwz',
                },
                {
                  url: 'https://res.cloudinary.com/doyl9cutp/image/upload/v1639590472/ReCamp/wglf0logp1hqspofvmgx.jpg',
                  filename: 'ReCamp/wglf0logp1hqspofvmgx',
                }
               
              ]
            //so we used shorthand i.e we dint do price:price
        }) 
        await camp.save();
    }
 }
 //for above
 //  1 we start by deleting everything
 //2 for 50 times we'll pick a random number to get city,state and 
 // then we save

 // we connect then we close out automatically without having to hit ctrl + c
seedDB().then(()=>{
    mongoose.connection.close();
})