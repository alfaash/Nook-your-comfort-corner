// Requiring Modules
const User = require('../models/user');
const {StatusCodes} = require("http-status-codes");
const {BadRequestError, NotFoundError, UnauthenticatedError} = require("../errors");

//  ------------------------------------------------ USER REGISTER CONTROLLER ---------------------------------------------------------------
const userRegister = async (req,res)=>{
    // getting username,password and name from body
    const {name, username, password} = req.body;
    // checking if username and password are provided or not
    if(!username || !password || !name){
        throw new BadRequestError("Please provide username, password and name");
    }

    // writing user in Database
    const user = await User.create({...req.body});
    // generating JWT token for user
    const token = user.createJWT();
    res.status(StatusCodes.CREATED).json({user : {name : user.name}, token, user});
}

//  ------------------------------------------------ USER LOGIN CONTROLLER ---------------------------------------------------------------
const userLogin = async (req,res)=>{
    // getting username and password from body
    const {username, password} = req.body;

    // checking if username and password are provided or not
    if(!username || !password){
        throw new BadRequestError("Please provide username and password");
    }

    // checking if user exists or not
    const user = await User.findOne({username});
    if(!user){
        throw new UnauthenticatedError("Username does not exist");
    }

    // comparing password
    const isPasswordCorrect = await user.comparePassword(password);
    if(!isPasswordCorrect){
        throw new UnauthenticatedError("Invalid password");
    }

    // If both username and password match we login the user
    const token = user.createJWT();
    res.status(StatusCodes.OK).json({user : {name : user.name}, token, user});
    
}

//  ------------------------------------------------ USER CONTACTS CONTROLLER ---------------------------------------------------------------
const userContact = async (req,res)=>{
    // Getting contactName and ContactNumber from body 
    const {contactName, phoneNumber} = req.body;
    // getting userId from req.user that our authntication middleware has set
    const userId = req.user.userId;

    // Checking if contact name and contact number is provided
    if(!contactName || !phoneNumber){
        throw new BadRequestError("Please provide contact name and contact number");
    }

    // Updating user contact information
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
            $push:{
                emergencyContacts : { contactName, phoneNumber }
            }
        },
        { new : true, runValidators : true } // return the updated doc & check schema rules
    )

    // sending OK status back
    res.status(StatusCodes.OK).json({ message : "Contact added Successfully", contacts : updatedUser.emergencyContacts });
}

//  ------------------------------------------------ GET USER DATA CONTROLLER ---------------------------------------------------------------

const getUserData = async (req,res)=>{
    // Getting user Id
    const idToSearch = req.user.userId;

    // Searching user in database and fetching it's details except password
    const user = await User.findById(idToSearch).select("-password");

    // If user does not exist
    if(!user){
        res.status(StatusCodes.NOT_FOUND).send("User not found");
        throw new NotFoundError("User not found");
    }

    // If user found
    res.status(StatusCodes.OK).json({user});
}

// Exporting modules
module.exports = {userRegister, userLogin, userContact, getUserData};