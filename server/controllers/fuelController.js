let fuels = [];


// Add fuel record
exports.addFuel = (req,res)=>{

    const fuel = {
        id: Date.now(),
        ...req.body
    };

    fuels.push(fuel);

    res.status(201).json(fuel);
};


// Get all fuel records
exports.getFuel = (req,res)=>{

    res.json(fuels);

};


// Delete fuel record
exports.deleteFuel = (req,res)=>{

    const id = Number(req.params.id);

    fuels = fuels.filter(
        fuel => fuel.id !== id
    );

    res.json({
        message:"Fuel deleted successfully"
    });

};