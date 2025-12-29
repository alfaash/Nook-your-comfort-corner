/* ---------- AUDIO RECORDING + FREQUENCY ---------- */
const rantBtn = document.getElementById("rantBtn");
const stopBtn = document.getElementById("stopBtn");
const timerEl = document.getElementById("timer");
const statusText = document.getElementById("status");
const container = document.getElementById("overlapContainer");
const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");

let mediaRecorder;
let audioChunks = [];
let analyser, dataArray, audioCtx, source;
let countdown;
let timeLeft = 60;
let isRecording = false;




/* ---------- AUDIO SETUP ---------- */
async function setupAudio() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioCtx.createAnalyser();
  source = audioCtx.createMediaStreamSource(stream);
  source.connect(analyser);

  analyser.fftSize = 256;
  dataArray = new Uint8Array(analyser.frequencyBinCount);

  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.ondataavailable = e => audioChunks.push(e.data);

mediaRecorder.onstop = () => {
  const blob = new Blob(audioChunks, { type: "audio/webm" });
  audioChunks = [];

  const reader = new FileReader();
  reader.onloadend = () => {
    const today = new Date().toISOString().split("T")[0];

    const recordings =
      JSON.parse(localStorage.getItem("recordings")) || {};

    if (!recordings[today]) recordings[today] = [];

    recordings[today].push({
      audio: reader.result,
      duration: 60 - timeLeft,
      createdAt: new Date().toISOString()
    });

    localStorage.setItem("recordings", JSON.stringify(recordings));
  };

  reader.readAsDataURL(blob);
};
}

/* ---------- VISUALIZER ---------- */
function drawVisualizer() {
  if (!isRecording) return;
  requestAnimationFrame(drawVisualizer);
  analyser.getByteFrequencyData(dataArray);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const barWidth = canvas.width / dataArray.length;

  dataArray.forEach((v, i) => {
    ctx.fillStyle = "#1abc9c";
    ctx.fillRect(i * barWidth, canvas.height - v / 2, barWidth, v / 2);
  });
}

/* ---------- STOP RECORDING FUNCTION ---------- */
function stopRecording() {
  clearInterval(countdown);
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }
  isRecording = false;
  statusText.innerText = "Saved. You survived the rant 💙";

  /* 🔁 RESET UI */
  container.classList.remove("active");
  rantBtn.disabled = false;
}

/* ---------- BUTTON CLICK LISTENERS ---------- */

// 1. STOP BUTTON CLICK
stopBtn.onclick = (e) => {
  e.stopPropagation(); 
  stopRecording();
};

// 2. START BUTTON CLICK
rantBtn.onclick = async () => {
  if (!mediaRecorder) await setupAudio();

  // Switch UI to Active
  container.classList.add("active");
  rantBtn.disabled = true;
  statusText.innerText = "Ranting... let it out 🔥";

  // Start Audio
  isRecording = true;
  mediaRecorder.start();
  drawVisualizer();

  // Start Timer
  timeLeft = 60;
  timerEl.innerText = timeLeft;

  countdown = setInterval(() => {
    timeLeft--;
    timerEl.innerText = timeLeft;

    if (timeLeft <= 0) {
      stopRecording();
    }
  }, 1000);
};