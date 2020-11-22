const express = require('express');
const router = express.Router();
const multer = require('multer'); //Middleware for handling multipart/form-data. Used for handling image uploads.
const AdminController = require('../controllers/admin');
const checkAuth = require('../middleware/check-auth');

const storage = multer.diskStorage({
    destination:function(req, file, cb){
        cb(null, './uploads/event_pics');
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

// Admin route to create an event
// Middleware ensures that user is authenticated before granting access to any of the routes.
router.post('/addevent', checkAuth, upload.single('image'), AdminController.addevent);

// Admin route to edit the details of an event
router.patch('/editevent/:event_id', checkAuth, AdminController.editevent)

// Admin route to delete an event
router.post('/delete_event', checkAuth, AdminController.delete_event);

// Admin route to get details on events and users 
router.post('/getdetails', AdminController.getdetails);


// Export the router
module.exports = router;