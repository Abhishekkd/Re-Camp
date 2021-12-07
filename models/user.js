const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose=require('passport-local-mongoose');

//user schema
const UserSchema = new Schema({
    email:{
        //these are not supposed to be validations ,it sets as an index
        //its just mapping of different collections keys from mongo to different types in js
        type:String,
        required:true,
        unique:true
    }
    //we aren't specifying username and password because of password 
});
//so passing in the result of that plugin to our schema
//and this going to add onto our schema a username,a password field
//and its gonna make sure that usernames are unique
//also going to give us additional method we can use
UserSchema.plugin(passportLocalMongoose);

module.exports=mongoose.model('User',UserSchema);