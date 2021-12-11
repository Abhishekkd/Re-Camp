//this returns a function that accepts a function and then it executes that function
//but it catches any errors and passes it to next,if there is an error
//we are gonna use this to wrap our async functions
//i.e returns a function that has func (which is the function that we passed in ) executed and then catches 
//any error and passes them to next
module.exports=function(func){
    return (req,res,next)=>{
        func(req,res,next).catch(next);
    }
}