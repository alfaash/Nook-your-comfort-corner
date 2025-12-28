// Requiring libraries
const express = require("express");
require("dotenv").config();
const connectDB = require("./db/connect"); // connectDB function to connect to Database

// Creating app
const app = express();

// Middlewares
app.use(express.json({ limit : '50mb' })); //to parse body of incoming POST request with increased limit

// Requiring routes
const userRouter = require("./routes/user");
const sensorRouter = require("./routes/sensor");
const alertRouter = require("./routes/alert");
const journalRouter = require("./routes/journal");


// Starting the server by connecting Database and then starting to listen to port
const startServer = async()=>{
    try {
        //connecting to database
        await connectDB(process.env.MONGO_URI);
        console.log("Database Connected Successfully!✅");

        // Routes
        app.use("/api/v1/users",userRouter); // User router
        app.use("/api/v1/motionData",sensorRouter); // Sensorary Data router
        app.use("/api/v1/alerts",alertRouter); // Alerts router
        app.use("/api/v1/journal",journalRouter) // Journal Router
        
        // Listening to port
        const port = 3000 || process.env.PORT;
        app.listen(port,()=>{
            console.log(`Server is listening to port ${port}✅`);
        })
    } catch (error) {
        // Error message 
        console.log("An Error Occured!❌");
        console.log("Error: ",error);
        process.exit(1);
    }
}

// Starting server! Hope all goes well.
startServer();
