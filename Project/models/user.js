// Requiring Libraries
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Creating user schema
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please prove a name"],
        minlength:2,
        maxlength:20
    },
    username:{
        type:String,
        required:[true,"Please provide a username"],
        unique:true
    },
    password:{
        type:String,
        required:[true,"Please provide a password"],
        minlength:6
    },
    emergencyContacts:[
        {
            contactName:{
                type: String,
                required: [true, "Plese provide a contact name"]
            },
            phoneNumber:{
                type: String,
                required: [true, "Contact number is required"],
                minlength:10,
                maxlength:10
            }
        }
    ],
    createdAt:{
        type:Date,
        default:Date.now
    }
});

// Pre function that hashed the passwords before they are saved so that they are securly encrypted
userSchema.pre('save', async function (){
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// function that generated JWT for user sessions
userSchema.methods.createJWT = function (){
    return jwt.sign(
        {
            userId : this._id,
            name : this.name
        },
        process.env.JWT_SECRET,
        {
            expiresIn : process.env.JWT_LIFETIME
        }
    );
}

// A function that check user's password while the user is trying to log in
userSchema.methods.comparePassword = async function (candidatePassword){
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
}

module.exports = mongoose.model('User', userSchema);

