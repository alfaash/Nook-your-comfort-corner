// Requiring Modules
const journalSchema = require("../models/journal");
const cloudinary = require("../utils/cloudinary");
const {BadRequestError, NotFoundError, UnauthenticatedError} = require("../errors");
const {StatusCodes} = require("http-status-codes");

// ---------------------------------------------------------------------------- UPLOAD JOURNAL --------------------------------------------------------------------------------

const uploadJournal = async (req,res)=>{
    // Getting voice journal data from req.body
    const {audioBase64, duration} = req.body;
    // Validating Data
    if(!audioBase64 || !duration){
        return res.status(StatusCodes.BAD_REQUEST).json({ message : "Audio data or Duration is missing" });
    }

    // After validation, uploading to cloudinary
    try {
        // Uploading to Cloudinary(auto detects audio recordings)
        const uploadResponse = await cloudinary.uploader.upload(audioBase64, {
            resource_type : "auto",
            folder : "nook_journals"
        });
        // Saving audio URL to mongoDB with other metadata
        const journal = await journalSchema.create({
            userId : req.user.userId,
            audioUrl : uploadResponse.secure_url,
            publicId : uploadResponse.public_id,
            duration : duration
        });
        // Seding Created Response 
        res.status(StatusCodes.CREATED).json({journal});
    } catch (error) {
        // Sending back error message
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message : "Something went wrong!", error_message : error });
    }
}
// ---------------------------------------------------------------------------- GET ALL JOURNAL --------------------------------------------------------------------------------

const getAllJournals = async (req,res)=>{
    // Getting users journals(recording) in the order of latest first
    const journals = await journalSchema.find({userId : req.user.userId}).sort({ timestamp: -1 });    
    // Validation
    if(!journals || journals.length==0){
        return res.status(StatusCodes.NOT_FOUND).json({message : "No journals found"});
    }
    // Returing journals if found
    res.status(StatusCodes.OK).json({journals});
}

// Exporting controllers

module.exports = {uploadJournal,getAllJournals};