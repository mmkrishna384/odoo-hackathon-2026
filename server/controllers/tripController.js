let trips=[];


// GET all trips
exports.getTrips=(req,res)=>{
    res.json(trips);
};


// CREATE trip
exports.createTrip=(req,res)=>{

    const trip={
        id:Date.now(),
        ...req.body
    };

    trips.push(trip);

    res.status(201).json(trip);
};


// UPDATE status
exports.updateTripStatus=(req,res)=>{

    const trip=trips.find(
        t=>t.id==req.params.id
    );

    if(!trip){
        return res.status(404).json({
            message:"Trip not found"
        });
    }


    trip.status=req.body.status;


    res.json(trip);
};