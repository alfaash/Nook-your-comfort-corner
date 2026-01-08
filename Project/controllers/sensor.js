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

    // 1. VALIDATION: Ensure essential data exists
    if (!sensorData || !sensorData.accelerometer || sensorData.accelerometer.x === undefined) {
        return res.status(StatusCodes.BAD_REQUEST).json({ 
            success: false, 
            message: "Incomplete sensor data! Accelerometer required." 
        });
    }

    try {
        // --- 1. PHYSICS CALCULATION ---
        const { x, y, z } = sensorData.accelerometer;
        const accMagnitude = Math.sqrt(x**2 + y**2 + z**2);

        // Handle potentially missing gyroscope data (default to 0)
        const alpha = sensorData.gyroscope?.alpha || 0;
        const beta = sensorData.gyroscope?.beta || 0;
        const gamma = sensorData.gyroscope?.gamma || 0;
        const gyroMagnitude = Math.sqrt(alpha**2 + beta**2 + gamma**2);


        // --- 2. ESTABLISH BASELINE (Before Saving) ---
        // Fetch history BEFORE saving the current crash to get a "pure" baseline.
        // This prevents the crash itself from skewing the average.
        const history = await sensorDataSchema.find({ userId })
            .sort({ timestamp: -1 }) 
            .limit(10); // Look at last ~10 seconds

        let averageForce = 9.8; // Default to 1g
        if (history.length > 0) {
            const sum = history.reduce((acc, item) => {
                const hx = item.sensorData.accelerometer.x;
                const hy = item.sensorData.accelerometer.y;
                const hz = item.sensorData.accelerometer.z;
                return acc + Math.sqrt(hx**2 + hy**2 + hz**2);
            }, 0);
            averageForce = sum / history.length;
        }


        // --- 3. SAVE CURRENT DATA ---
        await sensorDataSchema.create({
            userId: userId,
            sensorData: sensorData,
            timestamp: new Date() 
        });


// --- 4. DYNAMIC DETECTION LOGIC 🧠 ---
        let isAnomaly = false;
        let detectionReason = "Normal";

        // STATE DETECTION
// 1. STATE DETECTION (Are you moving?)
        const isActive = averageForce > 12.0; 

        // 2. DYNAMIC THRESHOLDS
        const DYNAMIC_IMPACT_THRESHOLD = isActive ? 45.0 : 25.0;
        
        // 🚀 FIX: Dynamic Critical Threshold
        // If Active (Waving/Jogging): Raise bar to 60.0 to ignore "Hammer" motions.
        // If Passive (Sitting): Keep at 50.0 to catch flat falls.
        const CRITICAL_THRESHOLD = isActive ? 60.0 : 50.0; 

        const TUMBLE_ROTATION_THRESHOLD = 300.0; 

        // 🛡️ WRIST FLICK FILTER (Unchanged)
        const isWristFlick = gyroMagnitude > 500.0;

        if (isWristFlick && accMagnitude < 60.0) {
             console.log(`🛡️ Filtered: High-Speed Wrist Flick (Spin: ${gyroMagnitude.toFixed(0)})`);
             isAnomaly = false;
        }
        else {
            // --- LAYER A: Critical Force (Dynamic) ---
            // Now uses CRITICAL_THRESHOLD (50 or 60) instead of hardcoded 50.
            if (accMagnitude > CRITICAL_THRESHOLD) {
                isAnomaly = true;
                detectionReason = `Critical Velocity Impact (>${CRITICAL_THRESHOLD} m/s²)`;
            } 
            
            // --- LAYER B: Sensor Fusion ---
            else if (accMagnitude > DYNAMIC_IMPACT_THRESHOLD && gyroMagnitude > TUMBLE_ROTATION_THRESHOLD) {
                isAnomaly = true;
                detectionReason = `Tumble Detected (Active: ${isActive})`;
            }

            // --- LAYER C: Relative Spike ---
            else if (
                accMagnitude > (averageForce * 2.0) && 
                accMagnitude > DYNAMIC_IMPACT_THRESHOLD && 
                gyroMagnitude > TUMBLE_ROTATION_THRESHOLD 
            ) {
                isAnomaly = true;
                detectionReason = `Relative Spike (Val: ${accMagnitude.toFixed(1)} vs Avg: ${averageForce.toFixed(1)})`;
            }
        }

        // --- 5. LOGGING & RESPONSE ---
        if (isAnomaly) {
            console.log(`🚨 DETECTED: ${detectionReason}`);
            console.log(`📊 Stats -> Force: ${accMagnitude.toFixed(1)} | Spin: ${gyroMagnitude.toFixed(1)} | Baseline: ${averageForce.toFixed(1)}`);
        }

        res.status(StatusCodes.CREATED).json({ 
            success: true, 
            isAnomaly: isAnomaly,
            currentMagnitude: accMagnitude,
            rotationMagnitude: gyroMagnitude,
            reason: detectionReason
        });

    } catch (error) {
        console.error("Sensor Controller Error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            success: false,
            message: "An error occurred", 
            error: error.message 
        });
    }
};

// Exporting controllers
module.exports = {getSensorData, storeSensorData};