// Requiring Modules
const {StatusCodes} = require("http-status-codes");
const alertSchema = require("../models/alert");
const User = require("../models/user");
const twilio = require("twilio");
const {NotFoundError, BadRequestError, UnauthenticatedError} = require("../errors");

// ----------------------------------------------------------------------------- GET ALERT ROUTE ------------------------------------------------------------

const getAlert = async (req,res)=>{
    // getting user id
    const userId = req.user.userId;
    // Searching for alert data in database from userId, in order of latest first
    const data =  await alertSchema.find({ userId : userId }).sort({ timestamp : -1 });
    // checking if we got data or not
    if(!data || data.length==0){
        return res.status(StatusCodes.NOT_FOUND).json({ message : "Data not found" });
    }
    // sending if data is found
    res.status(StatusCodes.OK).json(data);
}

// ----------------------------------------------------------------------------- POST ALERT ROUTE ------------------------------------------------------------
 
const postAlert = async (req,res)=>{
    //getting user id
    const userId = req.user.userId;
    // getting sensor data for the alert
    const {sensorData} = req.body;
    // Validating the sensor data
    if(!sensorData || !sensorData.accelerometer.x || !sensorData.accelerometer.y || !sensorData.accelerometer.z || !sensorData.gyroscope.alpha || !sensorData.gyroscope.beta || !sensorData.gyroscope.gamma){
        return res.status(StatusCodes.BAD_REQUEST).send("Please Provide complete sensor data!");
    }
    // if validated storing data in database
    const response  = await alertSchema.create({
        userId : userId,
        sensorData : sensorData
    });
    // sending response if data is storesd
    res.status(StatusCodes.CREATED).json({
        success: true,
        message : "Data stored",
        dataId : response._id
    });

}
// ----------------------------------------------------------------------------- SEND ALERT MESSAGE ROUTE ------------------------------------------------------------
const sendAlertMessage = async (req,res)=>{
    //getting user id
    const userId = req.user.userId;  
    console.log("📲 Sending Emergency SMS...");
    
    const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const user = await User.findById(userId);

    if (user && user.emergencyContacts && user.emergencyContacts.length > 0) {
        const alertPromises = user.emergencyContacts.map(contact => 
            client.messages.create({
                body: `🚨 NOOK ALERT: Attention ${contact.contactName}, A sudden impact detected for ${user.name}. Please check in!🚨`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: contact.phoneNumber
            })
        );
        await Promise.all(alertPromises);
    }
    res.status(StatusCodes.OK).json({message : "Message sent to emergency contacts"});
}
// Exporting modules
module.exports = {getAlert, postAlert, sendAlertMessage};