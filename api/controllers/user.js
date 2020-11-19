// Importing User model
const User = require('../models/user');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Hashing user passwords
const jwt = require('jsonwebtoken'); // Generating tokens for logged in users


// DOCUMENTATION
// This function is used by the users signup
// Method: POST
// Route: http://localhost:3000/signup/
// If succcessful, returns boolean true with a message and a status code of 201.
// If unsuccessful, return false with an error messsage with a status code of 500.
exports.signup = (req, res, next)=>{
    User.find({email: req.body.email})
    .exec()
    .then(user=>{
        if(user.length >= 1){
            return res.status(409).json({status:false, message:'User already exists'});
        }else{
            bcrypt.hash(req.body.password, 10, (error, hash)=>{
                if(error){
                    return res.status(500).json({
                        error:error
                    });
                }else{
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        first_name:req.body.first_name,
                        last_name:req.body.last_name,
                        email:req.body.email,
                        username:req.body.username,
                        picture:req.body.image,
                        password:hash,
                    });
                    user.save()
                    .then(result=>{
                        res.status(201).json({status:true, message:'Your account has been created'});
                    })
                    .catch(error=>{
                        console.log(error);
                        res.status(500).json({
                            status:false,
                            error:error
                        });
                    });
                }
            });
        }
    });
}


// DOCUMENTATION
// This function is used by the users login
// Method: POST
// Route: http://localhost:3000/login/
// Parameters: {email, password}
// If succcessful, returns token for user, boolean true with a message and a status code of 200.
// If unsuccessful, return false with an error messsage with a status code of 500.
exports.login = (req, res, next)=>{
    User.find({email:req.body.email})
    .exec()
    .then(user=>{
        if(user.length < 1){
            return res.status(401).json({status:false, message:"Authentication Failed"});
        }
        bcrypt.compare(req.body.password, user[0].password, function(error, results) {
            if (error){
              console.log(err);
              return res.json({status: false, message: 'Authentication failed'});
            }
            if (results){
              const token = jwt.sign({
                  _id: user[0]._id,
                  email: user[0].email,
                  isadmin:user[0].isadmin
                }, process.env.JWT_KEY,{
                    expiresIn: "1h"
                });
                return res.status(200).json({status:true, message:'Authentication Successful', token:token, user});
            } else {
                return res.json({status: false, message: 'Authentication failed'});
            }
        });
    })
    .catch(error=>{
        console.log(error);
        res.status(500).json({status:false, error:error});
    });
}
