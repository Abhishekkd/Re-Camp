module.exports.isLoggedIn = (req,res,next)=>{
//    /*for a given user here it contains _id,email and username*/ console.log("User->",req.user)
//    //contains deserialized info from the session about the user(meth from passport);
//     //i.e session contains serialized info passport gonna deserialized it the and fill in req.user with that data


 //can only be accessible if u're logged in 
 if(!req.isAuthenticated()){//this method from passport
    //so as to resume the page from where user left off before  logging in
    req.session.returnTo=req.originalUrl;//we can add in whatever we want in session
    req.flash('error',"you aren't signed in!")
    res.redirect('/login');//or return from here
    }else{
            //if authenticated  call next
        next();
    }
}