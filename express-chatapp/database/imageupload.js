const multer = require('multer');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET,
    secure: true
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if(file.fieldname === 'profile') {
            cb(null, '../../express-chatapp/public/images/profilepictures');
        }
        else if (file.fieldname === 'chat') {
            cb(null, '../../express-chatapp/public/images/chatmessages');
        }
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}`);
    }
});

module.exports.upload = multer({storage: storage});

module.exports.image;

module.exports.uploadImage = async (req) => {
    result = req.file !== undefined ? 
        await cloudinary.uploader.upload(path.join(`${req.file.destination}/${req.file.filename}`))
        :
        undefined
}