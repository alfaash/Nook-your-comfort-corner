/* ---------- 1. INITIALIZATION ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("sensor-modal");
  if (modal) modal.classList.remove("hidden");
});

let motionBuffer = [];
let orientationBuffer = [];

/* ---------- 2. THE PERMISSION FLOW ---------- */
async function requestSensorPermission() {
  try {
    if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function") {
      const permission = await DeviceMotionEvent.requestPermission();
      if (permission !== "granted") {
        alert("Sensor permission denied.");
        return;
      }
    }
    
    // Start sensors before moving to next modal
    startSensors();
    
    // Close Sensor Modal then Open Contact Modal
    closeSensorModal();
    const contactModal = document.getElementById("contact-modal");
    if (contactModal) contactModal.classList.remove("hidden");

  } catch (err) {
    console.error("Sensor Error:", err);
    // If desktop or error, move forward anyway
    closeSensorModal();
    document.getElementById("contact-modal").classList.remove("hidden");
  }
}

/* ---------- 3. SENSOR LOGIC ---------- */
function startSensors() {
  console.log("Tracking started...");

  // Motion Tracking
  window.addEventListener("devicemotion", (event) => {
    const acc = event.accelerationIncludingGravity;
    if (acc && acc.x !== null) {
      motionBuffer.push({ x: acc.x, y: acc.y, z: acc.z });
    }
  });

  // Orientation Tracking
  window.addEventListener("deviceorientation", (event) => {
    if (event.alpha !== null) {
      orientationBuffer.push({ alpha: event.alpha, beta: event.beta, gamma: event.gamma });
    }
  });

  // Process data every 10 seconds
  setInterval(processAndDisplayAverages, 10000);
}

/* ---------- 4. DATA PROCESSING ---------- */
function processAndDisplayAverages() {
  if (motionBuffer.length === 0 && orientationBuffer.length === 0) {
    console.log("No sensor data captured yet...");
    return;
  }

  const avgMotion = {
    x: motionBuffer.length ? motionBuffer.reduce((sum, d) => sum + d.x, 0) / motionBuffer.length : 0,
    y: motionBuffer.length ? motionBuffer.reduce((sum, d) => sum + d.y, 0) / motionBuffer.length : 0,
    z: motionBuffer.length ? motionBuffer.reduce((sum, d) => sum + d.z, 0) / motionBuffer.length : 0
  };

  const avgOrient = {
    alpha: orientationBuffer.length ? orientationBuffer.reduce((sum, d) => sum + d.alpha, 0) / orientationBuffer.length : 0,
    beta: orientationBuffer.length ? orientationBuffer.reduce((sum, d) => sum + d.beta, 0) / orientationBuffer.length : 0,
    gamma: orientationBuffer.length ? orientationBuffer.reduce((sum, d) => sum + d.gamma, 0) / orientationBuffer.length : 0
  };

  //next interval
  motionBuffer = [];
  orientationBuffer = [];

  updateUIList(avgMotion, avgOrient);
}

function updateUIList(motion, orient) {
  const list = document.getElementById('averages-list');
  if (!list) return;

  const li = document.createElement('li');
  const timestamp = new Date().toLocaleTimeString();

  li.innerHTML = `
    <strong>[${timestamp}]</strong><br>
    Accel: ${motion.x.toFixed(1)}, ${motion.y.toFixed(1)}, ${motion.z.toFixed(1)}<br>
    Gyro: ${orient.alpha.toFixed(0)}°, ${orient.beta.toFixed(0)}°, ${orient.gamma.toFixed(0)}°
  `;
  
  list.insertBefore(li, list.firstChild);
}

/* ---------- 5. HELPERS ---------- */
function closeSensorModal() {
  const modal = document.getElementById("sensor-modal");
  if (modal) modal.classList.add("hidden");
}

function saveManualContact() {
  const name = document.getElementById("contact-name").value;
  const phone = document.getElementById("contact-phone").value;

  if (!name || !phone) {
    alert("Please fill in both fields.");
    return;
  }

  localStorage.setItem("emergencyContact", JSON.stringify({ name, phone }));
  document.getElementById("contact-modal").classList.add("hidden");
  alert("Setup complete!");
}