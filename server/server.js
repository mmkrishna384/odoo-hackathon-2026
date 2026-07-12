require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const tripRoutes = require("./routes/tripRoutes");
const maintenanceRoutes = require("./routes/maintenanceRoutes");
const fuelRoutes = require("./routes/fuelRoutes");

const expenseRoutes = require("./routes/expenseRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");


const app = express();


connectDB();


app.use(cors());
app.use(express.json());


// Existing APIs
app.use("/api/trips", tripRoutes);

app.use("/api/maintenance", maintenanceRoutes);

app.use("/api/fuel", fuelRoutes);


// New APIs
app.use("/api/expenses", expenseRoutes);

app.use("/api/dashboard", dashboardRoutes);



const PORT = process.env.PORT || 5000;


app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
});