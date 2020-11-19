const mongoose = require('mongoose');
const Event = require('../models/event');
const User = require('../models/user');
const jwt = require('jsonwebtoken');


// DOCUMENTATION
// This function is used by both the admin and users to get all available events
// Method: GET
// Route: http://localhost:3000/events/
// The function first checks whether the user is authenticated.
// If succcessful, returns all event event details, route to each event, boolean true with a message and a status code of 200.
// If unsuccessful, return false with an error messsage with a status code of 500.
exports.get_all_events = (req, res, next) =>{
    Event.find()
    .exec()
    .then(results=>{
        const response = {
            status:true,
            count:results.length,
            events:results.map(event=>{
                return {
                    _id: event._id,
                    title: event.title,
                    venue: event.venue,
                    date: event.date,
                    speaker: event.speaker, 
                    tagline: event.tagline,
                    room_capacity: event.room_capacity, 
                    image:event.image,
                    request:{
                        type:'GET',
                        description:'Get event',
                        url:'http://localhost:4000/events/' + event._id
                    }
                };
            })
        };
        res.status(200).json(response);
    })
    .catch(error=>{
        console.log(error);
        res.status(500).json({status:false, error:error});
    });
}



// DOCUMENTATION
// This function is used by both the admin and users to get the details of one event
// Method: GET
// Route: http://localhost:3000/events/
// Parameter : Event ID
// The function first checks whether the user is authenticated.
// If succcessful, returns event details, route to view all available events, boolean true with a message and a status code of 200.
// If unsuccessful, return false with an error messsage with a status code of 500.
exports.get_event = (req, res, next) =>{
    const _id = req.params.event_id;
    Event.findById(_id)
    .exec()
    .then(results=>{
        if(results){
            res.status(200).json({
                status:true,
                Event:results,
                request:{
                    type:'GET',
                    description:'Get all events',
                    url:'http://localhost:4000/events/'
                }
            });
        }else{
            res.status(404).json({status:false, message:'No event found'});
        }
    })
    .catch(error=>{
        console.log(error);
        res.status(500).json({status:false, error:error});
    });
}


// DOCUMENTATION
// This function is used by the users to get register to attend an event
// Method: POST
// Route: http://localhost:3000/events/attend/
// The function first checks whether the user is authenticated.
// The function then checks whether the user has already registered for that event.
// The fuction then checks whether there are available seats under the event.
// If succcessful, returns the route to view the details of that event, boolean true with a message and a status code of 200.
// If unsuccessful, return false with an error messsage with a status code of 500.
exports.attend = (req, res, next) =>{
    const user_email = req.body.email
    const eventId = req.body.eventId
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    User.find({email:user_email})
    .exec()
    .then(user=>{
        if(decoded.email === user_email){
            const registered = (user[0].events.indexOf(eventId) != -1);
            if(registered === true){
                return res.status(200).json({status:false, message:'You have already booked this event'});
            }else{
                Event.find({_id:eventId})
                .exec()
                .then(event=>{
                    if(event[0].current_seat_number < event[0].room_capacity){
                        Event.findByIdAndUpdate(eventId,{
                            $push:{attendees:user[0]._id},
                            $inc:{current_seat_number:1}
                        },
                        {new:true, useFindAndModify:false})
                        .exec()
                        .then(result=>{
                            User.findByIdAndUpdate(user[0]._id,{
                                $push:{events:eventId}
                            },
                            {new:true, useFindAndModify:false})
                            .exec()
                            .then(results=>{
                                res.status(200).json({
                                    status:true,
                                    message:'You have registered to attend this event',
                                    query:{
                                        type:'GET',
                                        description:'Get event attendees',
                                        url:'http://localhost:4000/events/' + eventId
                                    }
                                });
                            })
                            .catch(error=>{
                                console.log(error);
                                res.status(500).json({status:false, error:error});
                            });
                        })
                        .catch(error=>{
                            console.log(error);
                            res.status(500).json({status:false, error:error});
                        });
                    }else{
                        return res.status(200).json({status:false, message:'This event is fully booked!'});
                    }
                })
                .catch(error=>{
                    console.log(error);
                    res.status(500).json({status:false, error:error});
                });
            }
        }
        else{
            return res.status(200).json({status:false, message:'You are not authorized to perform this action!'});
        }
    })
    .catch(error=>{
        console.log(error);
        res.status(500).json({status:false, error:error});
    });
}





// DOCUMENTATION
// This function is used by the users to get all events they have registered to attend
// Method: POST
// Route: http://localhost:3000/events/myevents/
// The function first checks whether the user is authenticated.
// It then ensures that the user has registered for an event.
exports.myevents = async (req, res, next) => {
    try {
        const user_id  = req.body.user_id;
        const response = await Event.find({attendees:user_id});
        if(response.length === 0){
            res.status(404).json({message: "You have not registered for an event yet"})
        }
        await res.status(200).json({events: response});
    } catch (error) {
        console.log(error);
        res.status(500).json({error:error});
    }
}



// DOCUMENTATION
// This function is used by the users to get register to attend an event
// Method: DELETE
// Route: http://localhost:3000/events/unattend/
// The function first checks whether the user is authenticated.
// If succcessful, returns boolean true with a message and a status code of 200.
// If unsuccessful, return false with an error messsage with a status code of 500.
exports.unattend = (req, res, next)=>{
    eventId = req.body.eventId
    user_email = req.body.email
    User.find({email:user_email})
    .exec()
    .then(user=>{
        Event.findOneAndUpdate(
            {_id:eventId},{
                $pull:{
                    attendees:user[0]._id
                },
                $inc: {
                    current_seat_number: -1
                }
            }
        )
        .exec()
        .then(event=>{
            User.findOneAndUpdate(
                {email:user_email},{
                    $pull:{
                        events:eventId
                    }
                }
            )
            .exec()
            .then(results=>{
                res.status(200).json({status:true, message:'You have unregistered from this event'});
            })
            .catch(error=>{
                console.log(error);
                res.status(500).json({status:false, error:error});
            });
        })
        .catch(error=>{
            console.log(error);
            res.status(500).json({status:false, error:error});
        });
    })
    .catch(error=>{
        console.log(error);
        res.status(500).json({status:false, error:error});
    });

}

