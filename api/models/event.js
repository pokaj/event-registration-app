const mongoose = require('mongoose');
const eventSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    title:{type:String, required:true},
    venue:{type:String, required:true},
    date:{type:Date, required:true},
    speaker:{type:String, required:true, unique:true}, 
    tagline:{type:String, required:true},
    room_capacity:{type:Number, required:true}, 
    current_seat_number:{type:Number, default:0},
    image:{type:String, required:true},
    attendees:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            default:null
        }
    ]  
});
module.exports = mongoose.model('Event', eventSchema);