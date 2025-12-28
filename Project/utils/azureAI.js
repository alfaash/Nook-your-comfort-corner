// Requiring Modules
const sdk = require("microsoft-cognitiveservices-speech-sdk");
const { TextAnalyticsClient, AzureKeyCredential } = require("@azure/ai-text-analytics");
const axios = require('axios');
const FormData = require('form-data');

// -------------------------------------------------------------------------- SPEECH TO TEXT (AZURE) ----------------------------------------------------------------------------
const convertSpeechToText = async (audioBuffer) => {
    try {
        // Use the stable 2024-11-15 API version
        const url = `https://${process.env.AZURE_SPEECH_REGION}.api.cognitive.microsoft.com/speechtotext/transcriptions:transcribe?api-version=2024-11-15`;

        // 1. Create the Form
        const form = new FormData();
        
        // 2. Add the Audio File
        form.append('audio', audioBuffer, {
            filename: 'audio.wav',
            contentType: 'audio/wav',
        });

        // 3. Add the Definition (Settings)
        const definition = JSON.stringify({
            locales: ["en-US"],
            profanityFilterMode: "None"
        });
        form.append('definition', definition);

        // 4. Send the Request
        const response = await axios.post(url, form, {
            headers: {
                ...form.getHeaders(), // This adds 'Content-Type: multipart/form-data; boundary=...'
                'Ocp-Apim-Subscription-Key': process.env.AZURE_SPEECH_KEY,
            }
        });

        // 5. Extract the text
        if (response.data && response.data.combinedPhrases) {
            return response.data.combinedPhrases[0].text;
        }
        
        return "";
    } catch (error) {
        // Log the detailed error from Azure if it fails
        console.error("Fast Transcription Error:", error.response?.data || error.message);
        return "";
    }
};

// -------------------------------------------------------------------- SENTIMENT ANALYSIS (AZURE) ----------------------------------------------------------------------------
const analyzeSentiment = async(text) =>{
    if(!text || text.trim().length === 0) return 0.5 // Neutral if no journal

    try {
        // Initializing Sentiment analysis client
        const client = new TextAnalyticsClient(
            process.env.AZURE_LANGUAGE_ENDPOINT,
            new AzureKeyCredential(process.env.AZURE_LANGUAGE_KEY)
        );

        // Analysing Sentiment
        const results = await client.analyzeSentiment([text]);
        const result = results[0];

        // Normalizing to 0-1 range
        let score = 0.5;
        if(!result.error){
            score = result.confidenceScores.positive - result.confidenceScores.negative;
            score = (score+1)/2;
        }
        // Returning Score within the 0-1 range
        return score;

    } catch (error) {
        console.error("Sentiment Error: ", error.message);
        return 0.5;
    }
};

// ------------------------------------------------------------------- GENERATING EMPATHETIC RESPONSE (GEMINI) ----------------------------------------------------------------------------
const generateAIResponse = async (text) => {
    if (!text || text.trim().length === 0) {
        return "I noticed you were quiet today. I'm here whenever you're ready.";
    }

    try {
        // We use the v1 endpoint directly (NOT v1beta)
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

        const data = {
            contents: [{
                parts: [{
                    text: `Act as Nook, a warm wellness companion. 
                           User journal: "${text}". 
                           Give a short, 1-sentence empathetic response making the user feel better and sounding like a real human`
                }]
            }],
            safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
            ]
        };

        const response = await axios.post(url, data, {
            headers: { 'Content-Type': 'application/json' }
        });

        // Extract text from the direct JSON response
        const aiText = response.data.candidates[0].content.parts[0].text;
        return aiText.trim();

    } catch (error) {
        // Detailed log to see the ACTUAL error from Google
        console.error("Gemini Direct API Error:", error.response ? error.response.data : error.message);
        return "I hear you, and I'm here for you today.";
    }
};

module.exports = {convertSpeechToText, analyzeSentiment, generateAIResponse};