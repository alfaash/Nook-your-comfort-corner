// Requiring Modules
const { StatusCodes } = require("http-status-codes");
const sensorDataSchema = require("../models/sensorData");
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
const storeSensorData = async (req,res)=>{
    // getting user id
    const userId = req.user.userId;
    // Getting the data from the body
    const {sensorData} = req.body;
    // Validating the sensor data
    if(!sensorData || !sensorData.accelerometer.x || !sensorData.accelerometer.y || !sensorData.accelerometer.z || !sensorData.gyroscope.alpha || !sensorData.gyroscope.beta || !sensorData.gyroscope.gamma){
        return res.status(StatusCodes.BAD_REQUEST).send("Please Provide complete sensor data!");
    }
    // If validated, storing data in database
    const response = await sensorDataSchema.create({
        userId : userId,
        sensorData: sensorData
    });
    // Sending success response
    res.status(StatusCodes.CREATED).json({
        success : true,
        message : "Data saved successfully",
        dataId : response._id
    });
}

// Exporting controllers
module.exports = {getSensorData, storeSensorData};