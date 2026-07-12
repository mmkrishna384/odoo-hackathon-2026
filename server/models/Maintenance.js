const mongoose=require("mongoose");


const maintenanceSchema=new mongoose.Schema({

vehicleId:{
type:String,
required:true
},

issue:{
type:String,
required:true
},

cost:{
type:Number,
default:0
},

status:{
type:String,
enum:[
"Pending",
"In Progress",
"Completed"
],
default:"Pending"
},

date:{
type:Date,
default:Date.now
}

});


module.exports=mongoose.model(
"Maintenance",
maintenanceSchema
);