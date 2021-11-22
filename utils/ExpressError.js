class ExpressError extends Error{
    constructor(message,statusCode){
        super();
        //find the status code and message from arguments and set those as properties
        this.message=message;
        this.statusCode=statusCode;
    }
}
module.exports=ExpressError;