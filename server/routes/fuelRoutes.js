const express = require("express");

const router = express.Router();


const {
    addFuel,
    getFuel,
    deleteFuel
}=require("../controllers/fuelController");



router.get("/",getFuel);

router.post("/",addFuel);

router.delete("/:id",deleteFuel);


module.exports=router;