const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
{
    vehicleId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Vehicle",
        required:true
    },

    driverId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Driver",
        required:true
    },

    source:{
        type:String,
        required:true
    },

    destination:{
        type:String,
        required:true
    },

    startDate:{
        type:Date,
        required:true
    },

    endDate:{
        type:Date
    },

    status:{
        type:String,
        enum:[
            "Scheduled",
            "Ongoing",
            "Completed",
            "Cancelled"
        ],
        default:"Scheduled"
    },

    distance:{
        type:Number
    },

    fuelConsumed:{
        type:Number
    },

    expense:{
        type:Number
    }

},
{
    timestamps:true
});


module.exports = mongoose.model("Trip",tripSchema);