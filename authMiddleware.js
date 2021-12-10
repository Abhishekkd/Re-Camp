module.exports.isLoggedIn = (req,res,next)=>{
    
 //can only be accessible if u're logged in 
 if(!req.isAuthenticated()){//this method from passport
    req.flash('error',"you aren't signed in!")
    res.redirect('/login');//or return from here
    }else{
            //if authenticated  call next
        next();
    }
}