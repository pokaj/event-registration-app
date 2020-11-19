const express = require('express');
const router = express.Router();
const multer = require('multer'); //Middleware for handling multipart/form-data. Used for handling image uploads.
const UserController = require('../controllers/user');
const checkAuth = require('../middleware/check-auth');

const storage = multer.diskStorage({
    destination:function(req, file, cb){
        cb(null, './uploads/profile_pics');
    },
    filename: function(req, file, cb){
        cb(null, file.originalname)
    }
});

const fileFilter = (req, file, cb)=>{
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true);
    }else{
        cb(null, false);
    };
};

const upload = multer({
    storage:storage, 
    limits:{fileSize:1024 * 1024 * 5},
    fileFilter:fileFilter
});


// Route to signup
router.post('/signup', upload.single('picture'), UserController.signup);

// Route to login
router.post('/login', UserController.login);

//Routeto change password
router.post('/updatepassword', checkAuth, UserController.updatepassword);



// Export the router
module.exports = router;