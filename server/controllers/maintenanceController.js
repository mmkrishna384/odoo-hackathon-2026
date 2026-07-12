let maintenance=[];


exports.addMaintenance=(req,res)=>{

    const data={
        id:Date.now(),
        ...req.body
    };

    maintenance.push(data);

    res.status(201).json(data);
};



exports.getMaintenance=(req,res)=>{

    res.json(maintenance);

};