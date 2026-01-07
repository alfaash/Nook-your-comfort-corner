// Requiring Modules
const { StatusCodes } = require("http-status-codes");
const sensorDataSchema = require("../models/sensorData");
const User = require("../models/user");
const {BadRequestEroor, NotFoundError, UnauthenticatedError} = require("../errors");

// ------------------------------------------------------------------- GET SENSOR DATA CONTROLLER ----------------------------------------------
const getSensorData = async (req,res)=>{
    // Getting user id
    const userId = req.user.userId;
    // Searching for sensor data in database by the user Id and send them in the order of latest data first
    const data = await sensorDataSchema.find({ userId: userId }).sort({ timestamp: -1 });
    // checking if we got any data or not
    if(!data || data.length==0){
        return res.status(StatusCodes.NOT_FOUND).send("No Data Found");
    }
    // Sending data if found
    res.status(StatusCodes.OK).json(data);
}

// ------------------------------------------------------------------- STORE SENSOR DATA CONTROLLER ----------------------------------------------
const storeSensorData = async (req, res) => {
    const userId = req.user.userId;
    const { sensorData } = req.body;

    // 1. Validate Input
    if (!sensorData || !sensorData.accelerometer || sensorData.accelerometer.x === undefined || sensorData.accelerometer.y === undefined || sensorData.accelerometer.z === undefined) {
        return res.status(StatusCodes.BAD_REQUEST).send("Please provide complete sensor data!");
    }

    try {
        // 2. Calculate Current Magnitude (Total Force)
        const { x, y, z } = sensorData.accelerometer;
        const currentMagnitude = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));

        // 3. Store Data (Background)
        const savedDoc = await sensorDataSchema.create({
            userId: userId,
            sensorData: sensorData,
            timestamp: new Date() 
        });

        // 4. Fetch History (For context)
        const history = await sensorDataSchema.find({ userId })
            .sort({ timestamp: -1 }) 
            .limit(30); 

        // 5. THE LOCAL DETECTION LOGIC 🧠
        let isAnomaly = false;

        // Logic: A fall is a massive spike in G-force.
        // Normal gravity is ~9.8. Walking is ~12-15. A hard fall is > 30.
        const HARD_IMPACT_THRESHOLD = 10.0; 

        if (currentMagnitude > HARD_IMPACT_THRESHOLD) {
            isAnomaly = true;
            console.log(`🚨 HARD FALL DETECTED! Magnitude: ${currentMagnitude.toFixed(2)} m/s²`);
        } 
        // Secondary Check: Spike relative to recent history
        else if (history.length >= 10) {
            const sum = history.reduce((acc, item) => {
                const hx = item.sensorData.accelerometer.x;
                const hy = item.sensorData.accelerometer.y;
                const hz = item.sensorData.accelerometer.z;
                return acc + Math.sqrt(hx**2 + hy**2 + hz**2);
            }, 0);
            const average = sum / history.length;
            
            // If current force is 3x the average of last few seconds -> Anomaly
            if (currentMagnitude > (average * 3)) {
                isAnomaly = true;
                console.log(`⚠️ SUDDEN SPIKE DETECTED! Value: ${currentMagnitude.toFixed(2)} (Avg: ${average.toFixed(2)})`);
            }
        }

        res.status(StatusCodes.CREATED).json({ 
            success: true, 
            isAnomaly: isAnomaly,
            currentMagnitude: currentMagnitude 
        });
    } catch (error) {
        console.error("Sensor Controller Error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            message: "An error occurred", 
            error: error.message 
        });
    }
};

// Exporting controllers
module.exports = {getSensorData, storeSensorData};