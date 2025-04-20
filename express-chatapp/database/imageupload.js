const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET,
    secure: true
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if(file.fieldname === 'profile') {
            cb(null, '../express-chatapp/public/profilepictures');
        }
        else if (file.fieldname === 'chat') {
            cb(null, '../express-chatapp/public/chatmessages');
        }
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}`);
    }
});

module.exports.upload = multer({storage: storage});

module.exports.uploadImage = async (req) => {
    let result;

    if(req.file !== undefined) {
        result = await cloudinary.v2.uploader.upload(path.join(`${req.file.destination}/${req.file.filename}`))
    }
    else {
        result = null;
    }

    return result;
}