const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Event = require('../models/event');
const User = require('../models/user');


// DOCUMENTATION
// This function is used by the admin of the system to create an event
// Method: POST
// Route: http://localhost:3000/admin/addevent
// Parameters: {title, venue, datae, speaker, topic, tagline, room_capacity, image}
// The function first checks whether the user is authenticated and whether the use is an admin(addevent route)
// If succcessful, returns event details, route to view created event, boolean true with a message and a status code of 201.
// If unsuccessful, return false with an error messsage with a status code of 500.
exports.addevent = (req, res, next)=>{
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    if(decoded.isadmin === false){
        return res.status(500).json({status:false, message:'You are not authorized to perform this action.'});
    }else{
        Event.find({title: req.body.title})
        .exec()
        .then(event=>{
            if(event.length >= 1){
                res.status(409).json({status:false, message:'This event already exists'});
            }else{
                const newEvent = new Event({
                    _id: new mongoose.Types.ObjectId(),
                    title: req.body.title,
                    venue: req.body.venue,
                    date: req.body.date,
                    speaker: req.body.speaker, 
                    tagline: req.body.tagline,
                    room_capacity: req.body.room_capacity, 
                    image:req.file.path
                });
                newEvent.save()
                .then(result=>{
                    res.status(201).json({
                        status:true,
                        message:'Created event succesfully',
                        created_event:{
                            _id:result._id,
                            title:result.title,
                            venue:result.venue,
                            date:result.date,
                            speaker:result.speaker,
                            tagline:result.tagline,
                            room_capacity:result.room_capacity,
                            image:result.image,
                            request:{
                                type:'GET',
                                description:'Get event',
                                url:'http://localhost:4000/events/' + result._id
                            }
                        },
                    });
                })
                .catch(error=>{
                    console.log(error);
                    res.status(500).json({status:false, error:error});
                })
            }
        })
        .catch(error=>{
            console.log(error);
            res.status(500).json({status:false, error:error});
        });
    }
}


// DOCUMENTATION
// This function is used by the admin of the system to edit an event
// Method: PATCH
// Route: http://localhost:3000/admin/editevent/:event_id
// Parameters: {title, venue, datae, speaker, topic, tagline, room_capacity, image}
// The function first checks whether the user is authenticated and whether the use is an admin(editevent route)
// If succcessful, returns route to view edited event, boolean true with a message and a status code of 200.
// If unsuccessful, return false with an error messsage with a status code of 500.
exports.editevent = (req, res, next)=>{
    const _id = req.params.event_id;
    const updateOps = {}
    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    Event.updateOne({_id:_id},{$set:updateOps})
    .exec()
    .then(result=>{
        res.status(200).json({
            message:'Event Updated',
            request:{
                type:'GET',
                description:'Get Event',
                url:'http://localhost:4000/events/' + _id
            }
        });
    })
    .catch(error=>{
        console.log(error);
        res.status(500).json({error:error});
    })

}

exports.getdetails = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        if(decoded.isadmin === false){
            return res.status(500).json({message: 'You are no authorized to perform this action'});
        }
        const users = await User.find({});
        const events = await Event.find({});
        return res.status(200).json({users: users, events: events});
    } catch (error) {
        return res.status(500).json(error);
    }
}




// DOCUMENTATION
// This function is used by the admin of the system to delete an event
// Method: DELETE
// Route: http://localhost:3000/admin/delete_event/:event_id
// Parameters: Event ID
// The function first checks whether the user is authenticated and whether the use is an admin(delete_event route)
// If succcessful, returns route to create am event, boolean true with a message and a status code of 200.
// If unsuccessful, return false with an error messsage with a status code of 500.
exports.delete_event = async (req, res, next)=>{
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    if(decoded.isadmin === false){
        return res.status(500).json({message:'You are not authorized to perform this action.'});
    }else{
        try {
            const _id = req.body.event_id;
            const event = await Event.find({_id:_id});
            if(event[0].current_seat_number > 0 ){
                return res.status(200).json({status: false, message: 'People have registered for this event. Sorry, you cannot delete.'});
            }else{
                await Event.deleteOne({_id:_id});
                return res.status(200).json({status: true, message: 'Event successfully deleted.'});
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({status: false, message: 'An error occurred while trying to delete this event'});
        }
    }
}

