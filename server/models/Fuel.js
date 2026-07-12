const mongoose = require("mongoose");


const fuelSchema = new mongoose.Schema({

    vehicleId:{
        type:String,
        required:true
    },

    liters:{
        type:Number,
        required:true
    },

    cost:{
        type:Number,
        required:true
    },

    date:{
        type:Date,
        default:Date.now
    }

});


const Fuel = mongoose.model("Fuel", fuelSchema);


module.exports = Fuel;