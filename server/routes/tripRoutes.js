const express = require("express");
const router = express.Router();

const {
    createTrip,
    getTrips
} = require("../controllers/tripController");


router.get("/", getTrips);

router.post("/", createTrip);


module.exports = router;