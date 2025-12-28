// Requiring Modules
const journalSchema = require("../models/journal");
const cloudinary = require("../utils/cloudinary");
const {BadRequestError, NotFoundError, UnauthenticatedError} = require("../errors");
const {StatusCodes} = require("http-status-codes");
const { convertSpeechToText, analyzeSentiment, generateAIResponse } = require("../utils/azureAI");

// ---------------------------------------------------------------------------- UPLOAD JOURNAL --------------------------------------------------------------------------------

const uploadJournal = async (req, res) => {
    try {
        const { audioBase64, duration } = req.body;
        
        // Start a timer in your console to see exactly where time goes
        console.time("⏱️ Total Pipeline");

        // 1. Immediately convert to Buffer (No waiting)
        const audioBuffer = Buffer.from(audioBase64.split(';base64,').pop(), 'base64');

        // 🚀 STEP 1: Racing Transcription and Cloudinary
        // We start both at once. The transcript is the 'Key' to step 2.
        const [transcript, uploadResponse] = await Promise.all([
            convertSpeechToText(audioBuffer),
            cloudinary.uploader.upload(audioBase64, { resource_type: "video" })
        ]);
        
        console.timeLog("⏱️ Total Pipeline", "Transcript & Cloudinary Done");

        // 🚀 STEP 2: Racing Sentiment and AI Response
        // We trigger these the moment the transcript returns.
        // We don't wait for Sentiment to finish before starting the AI.
        const [sentimentScore, aiResponse] = await Promise.all([
            analyzeSentiment(transcript),
            generateAIResponse(transcript) 
        ]);

        console.timeEnd("⏱️ Total Pipeline");

        // 2. Final DB Save
        const journal = await journalSchema.create({
            userId: req.user.userId,
            audioUrl: uploadResponse.secure_url,
            transcript,
            sentimentScore,
            aiResponse,
            duration,
            publicId:uploadResponse.public_id
        });

        res.status(201).json({ journal });

    } catch (error) {
        console.error("Pipeline Error:", error);
        res.status(500).json({ message: "Error", error: error.message });
    }
};
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

// ---------------------------------------------------------------------------- DELETE A JOURNAL --------------------------------------------------------------------------------

const deleteJournal = async (req,res)=>{
    const journalId = req.params.id;
    try {
        // Fetching the journal in Database
        const journal = await journalSchema.findById(journalId);
        // Validation
        if(!journal){
            return res.status(StatusCodes.NOT_FOUND).json({message : "The journal you are looking for does not exist"});
        }
        // Checking if the user owns this journal or not for security
        if(journal.userId.toString() !== req.user.userId){
            return res.status(StatusCodes.NOT_FOUND).json({message : "You cannot delete this journal"});        
        }
        // After validation
        // Delete from cloudinary
        await cloudinary.uploader.destroy(journal.publicId, {resource_type : "video", invalidate: true});
        // Delete from database
        await journalSchema.findByIdAndDelete(journalId);
        // Sending OK response
        res.status(StatusCodes.OK).json({message : "Journal Deleted Successfully!"});
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message : "Something went wrong", errorMessage: error});
    }
}

// Exporting controllers

module.exports = {uploadJournal,getAllJournals, deleteJournal};