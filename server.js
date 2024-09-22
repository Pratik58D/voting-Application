const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const PORT =  process.env .PORT || 3000
const userRoute = require("./src/routes/userRoute");
const candidateRoute = require("./src/routes/candidateRoute");
const dbconnect = require("./src/config/db");

//database connection
dbconnect()

app.use(express.json());

app.use("/api/user",userRoute)
//candidate Route
app.use("/api/candidate/",candidateRoute)




app.listen(PORT , ()=> console.log(`server started ${PORT}`))

