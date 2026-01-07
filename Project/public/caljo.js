/* ---------- 1. DOM ELEMENTS ---------- */
const rantBtn = document.getElementById("rantBtn");
const stopBtn = document.getElementById("stopBtn");
const timerEl = document.getElementById("timer");
const statusText = document.getElementById("status");
const canvas = document.getElementById("visualizer");
const container = document.getElementById("overlapContainer"); 
const ctx = canvas.getContext("2d");

/* ---------- 2. GLOBALS ---------- */
let audioCtx, processor, analyser, source, stream;
let leftChannel = [];
let isRecording = false;
let timeLeft = 60;
let countdown; 
let dataArray;

/* ---------- 3. AUDIO SETUP & RECORDING ---------- */

async function setupAudio() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        audioCtx = new (window.AudioContext || window.webkitAudioContext)({
            sampleRate: 16000, 
        });

        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        dataArray = new Uint8Array(analyser.frequencyBinCount);

        processor = audioCtx.createScriptProcessor(4096, 1, 1);
        source = audioCtx.createMediaStreamSource(stream);
        
        source.connect(analyser);
        source.connect(processor);
        processor.connect(audioCtx.destination);

        processor.onaudioprocess = (e) => {
            if (!isRecording) return;
            const left = e.inputBuffer.getChannelData(0);
            leftChannel.push(new Float32Array(left)); 
        };

        startRecordingLogic();
    } catch (err) {
        console.error("Mic Error:", err);
        alert("Microphone access is required.");
    }
}

function startRecordingLogic() {
    isRecording = true;
    leftChannel = [];

    // UI Feedback
    container.classList.add("active"); 
    rantBtn.disabled = true;           
    statusText.innerText = "let everything out!";

    // Timer Logic
    timeLeft = 60;
    timerEl.innerText = timeLeft;
    
    if (countdown) clearInterval(countdown);
    countdown = setInterval(() => {
        timeLeft--;
        timerEl.innerText = timeLeft;
        if (timeLeft <= 0) stopRecording();
    }, 1000);

    drawVisualizer();
}

/* ---------- 3. AUDIO SETUP & RECORDING ---------- */

function toggleLoader(show) {
    const loaderId = "ai-loader";
    let loader = document.getElementById(loaderId);

    if (show) {
        if (!loader) {
            loader = document.createElement("div");
            loader.id = loaderId;
            loader.innerHTML = `
                <div class="audio-wave">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <p class="loading-msg">Listening to your heart...</p>
            `;
            rantBtn.parentNode.insertBefore(loader, rantBtn);
        }
        loader.style.display = "flex";
    } else if (loader) {
        loader.style.display = "none";
    }
}
function stopRecording() {
    if (!isRecording) return;
    isRecording = false;
    clearInterval(countdown);
    
    //Vanish the button and SHOW the loader
    rantBtn.style.display = "none"; 
    toggleLoader(true); 
    
    container.classList.remove("active");
    statusText.innerText = ""; 
    const flatBuffer = flattenArray(leftChannel);
    const wavBlob = exportWAV(flatBuffer, audioCtx.sampleRate);
    
    if (stream) stream.getTracks().forEach(track => track.stop());
    
    uploadToBackend(wavBlob);
}

/* ---------- 4. BACKEND SYNC ---------- */

async function uploadToBackend(blob) {
    const finalDuration = 60 - timeLeft;
    const reader = new FileReader();
    reader.readAsDataURL(blob); 

    reader.onloadend = async () => {
        const base64String = reader.result;
        const token = localStorage.getItem('token'); 

        try {
            const response = await fetch('https://nook-your-comfort-corner.onrender.com/api/v1/journal', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    audioBase64: base64String,
                    duration: finalDuration
                })
            });

            const result = await response.json();

            toggleLoader(false); 

            if (response.ok) {
                const displayMsg = result.aiResponse || (result.journal && result.journal.aiResponse) || "I'm listening...";
                
                statusText.innerHTML = `
                    <div class="ai-response-container">
                        <span class="ai-label">AI INSIGHT</span>
                        <h2 class="ai-main-text">${displayMsg}</h2>
                    </div>
                `;
            } else {
                statusText.innerText = "Error: " + (result.message || "Failed to save");
            }
        } catch (e) {
            toggleLoader(false); 
            statusText.innerText = "Status: Connection Error.";
            console.error(e);
        } finally {
            // Button reappears
            rantBtn.style.display = "block";
            rantBtn.disabled = false;
        }
    };
}
/* ---------- 5. VISUALIZER & HELPERS ---------- */

function drawVisualizer() {
    if (!isRecording) return;
    requestAnimationFrame(drawVisualizer);
    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const barWidth = (canvas.width / dataArray.length) * 2.5;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
        const barHeight = dataArray[i] / 2;
        ctx.fillStyle = "#000000"; 
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
    }
}

function flattenArray(channelBuffer) {
    let result = new Float32Array(channelBuffer.reduce((acc, curr) => acc + curr.length, 0));
    let offset = 0;
    for (let i = 0; i < channelBuffer.length; i++) {
        result.set(channelBuffer[i], offset);
        offset += channelBuffer[i].length;
    }
    return result;
}

function exportWAV(flatBuffer, sampleRate) {
    const buffer = new ArrayBuffer(44 + flatBuffer.length * 2);
    const view = new DataView(buffer);
    const writeString = (v, o, s) => { for (let i=0; i<s.length; i++) v.setUint8(o+i, s.charCodeAt(i)); };

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + flatBuffer.length * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); 
    view.setUint16(22, 1, true); 
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, flatBuffer.length * 2, true);

    let offset = 44;
    for (let i = 0; i < flatBuffer.length; i++, offset += 2) {
        let s = Math.max(-1, Math.min(1, flatBuffer[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return new Blob([view], { type: 'audio/wav' });
}

/* ---------- 6. EVENT LISTENERS ---------- */

rantBtn.onclick = async () => {
    if (!isRecording) await setupAudio();
};

stopBtn.onclick = (e) => {
    e.stopPropagation(); 
    stopRecording();
};