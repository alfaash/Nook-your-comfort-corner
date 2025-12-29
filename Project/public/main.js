document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("sensor-modal");
  if (modal) modal.classList.remove("hidden");
});

let motionBuffer = [];
let orientationBuffer = [];

/* ------- PERMISSION ---------- */
async function requestSensorPermission() {
  try {
    if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function") {
      const permission = await DeviceMotionEvent.requestPermission();
      if (permission !== "granted") {
        alert("Sensor permission denied.");
        return;
      }
    }
    
    startSensors();
    
    closeSensorModal();
    const contactModal = document.getElementById("contact-modal");
    if (contactModal) contactModal.classList.remove("hidden");

  } catch (err) {
    console.error("Sensor Error:", err);
    closeSensorModal();
    document.getElementById("contact-modal").classList.remove("hidden");
  }
}

/* ----------  SENSOR LOGIC ---------- */
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

  //  10 seconds
  setInterval(processAndDisplayAverages, 10000);
}

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

function closeSensorModal() {
  const modal = document.getElementById("sensor-modal");
  if (modal) modal.classList.add("hidden");
}


//for emergency contact
async function saveManualContact() {
  const contactName = document.getElementById("contact-name").value;
  const phoneNumber = document.getElementById("contact-phone").value;
  const token = localStorage.getItem('token'); 
  if (!contactName || !phoneNumber) {
    alert("Please fill in both fields.");
    return;
  }

  // If there is no token
  if (!token) {
    alert("User not authenticated. Please login again.");
    window.location.href = "index.html";
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/v1/users/contacts', {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ contactName, phoneNumber })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("emergencyContact", JSON.stringify({ contactName, phoneNumber }));
      
      document.getElementById("contact-modal").classList.add("hidden");
      alert("Emergency contact added to your Nook!");
    } else {
      alert(data.msg || "Failed to save contact.");
    }
  } catch (error) {
    console.error("Fetch Error:", error);
    alert("Server error. Please try again later.");
  }
}