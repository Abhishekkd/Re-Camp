const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

//passing in cloudinary to this cloudinary storage
//setting config on our cloudinary
cloudinary.config({
    //this is basically associating our account with this cloudinary instance
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})
//instantiating an instance of a cloudinaryStorage
const storage = new CloudinaryStorage({
    //we need to pass in the cloudinary object we just configured
    cloudinary,
    params:{
        folder: 'ReCamp', //this is the folder in cloudinary that we should store things in
        allowedFormats:['jpeg','png','jpg']
    }
})
//this cloudinaryStorage is now configured,its set up so that it has the credentials for out particular cloudinary account 

module.exports = {
    cloudinary,
    storage
}