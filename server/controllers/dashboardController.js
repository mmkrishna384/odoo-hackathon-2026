exports.getDashboard=(req,res)=>{


    res.json({

        totalTrips:0,

        ongoingTrips:0,

        completedTrips:0,

        totalFuelUsed:0,

        totalExpense:0,

        activeVehicles:0

    });


};