document.addEventListener("DOMContentLoaded", () => {
  // Not asking for user's permission to start the capturing the device motion data
  requestSensorPermission();
  // const modal = document.getElementById("sensor-modal");
  // if (modal) modal.classList.remove("hidden");
});

let currentSensorData;
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
    // Ask for user emergency contact only if there are no emergency contacts registered already
    const token = localStorage.getItem('token'); 
    const response = await fetch(`https://nook-your-comfort-corner.onrender.com/api/v1/users`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          }
    });
    const userData = await response.json();
    if(userData.user.emergencyContacts.length==0){
      const contactModal = document.getElementById("contact-modal");
      if (contactModal) contactModal.classList.remove("hidden");
    }

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

async function processAndDisplayAverages() {
  if (motionBuffer.length === 0 && orientationBuffer.length === 0) {
    alert("No sensor data captured yet...");
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

  currentSensorData = {accelerometer: avgMotion, gyroscope:avgOrient};
  //next interval
  motionBuffer = [];
  orientationBuffer = [];

  try {
    const data = await fetch('https://nook-your-comfort-corner.onrender.com/api/v1/motionData', {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({
        sensorData: {
          accelerometer: avgMotion,
          gyroscope: avgOrient      
        }
      })
    });
    const response  = await data.json();
    if(response.success){
      console.log("Data stored successfully");
      if(response.isAnomaly){
        startUI();
        // let sensorData = {accelerometer: avgMotion, gyroscope: avgOrient};
        // handleAnomalyDetected(sensorData);
      }
    }
    else{
      console.log("Data not stored!");
    }
  } catch (error) {
    console.log(error);
  }
}

// function updateUIList(motion, orient) {
//   const list = document.getElementById('averages-list');
//   if (!list) return;

//   const li = document.createElement('li');
//   const timestamp = new Date().toLocaleTimeString();

//   li.innerHTML = `
//     <strong>[${timestamp}]</strong><br>
//     Accel: ${motion.x.toFixed(1)}, ${motion.y.toFixed(1)}, ${motion.z.toFixed(1)}<br>
//     Gyro: ${orient.alpha.toFixed(0)}°, ${orient.beta.toFixed(0)}°, ${orient.gamma.toFixed(0)}°
//   `;
  
//   list.insertBefore(li, list.firstChild);
// }

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
    const response = await fetch('https://nook-your-comfort-corner.onrender.com/api/v1/users/contacts', {
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




//alert call
const API_BASE_URL = "https://nook-your-comfort-corner.onrender.com/api/v1";
let countdownInterval = null;
let currentAlertId = null; 
let timeLeftt = 30;

// MONITOR SENSORS
// window.addEventListener("devicemotion", (event) => {
//     const acc = event.accelerationIncludingGravity;
//     const gyro = event.rotationRate;

//     if (acc && acc.x !== null) {
//         // Logic to detect anomaly 
//         const totalForce = Math.sqrt(acc.x**2 + acc.y**2 + acc.z**2);
        
//         if (totalForce > 25 && !currentAlertId) { 
//             const sensorData = {
//                 accelerometer: { x: acc.x, y: acc.y, z: acc.z },
//                 gyroscope: { 
//                     alpha: gyro?.alpha || 0, 
//                     beta: gyro?.beta || 0, 
//                     gamma: gyro?.gamma || 0 
//                 }
//             };
//             handleAnomalyDetected(sensorData);
//         }
//     }
// });


//POST TO /alerts
// async function handleAnomalyDetected(sensorData) {
//     const token = localStorage.getItem("token");

//     try {
//         const response = await fetch(`${API_BASE_URL}/alerts`, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 "Authorization": `Bearer ${token}`
//             },
//             body: JSON.stringify({ sensorData })
//         });

//         const result = await response.json();

//         if (response.ok) {
//             currentAlertId = result.dataId; 
//             startUI();
//         }
//     } catch (err) {
//         console.error("Failed to start alert sequence", err);
//     }
// }

// START 30 SEC TIMER
function startUI() {
    const overlay = document.getElementById('emergency-overlay');
    const display = document.getElementById('countdown-number');
    const progressBar = document.getElementById('progress-bar');
    
    overlay.classList.remove('hidden');
    timeLeftt = 30;

    countdownInterval = setInterval(() => {
        timeLeftt--;
        display.innerText = timeLeftt;
        progressBar.style.width = `${(timeLeftt / 30) * 100}%`;

        if (timeLeftt <= 0) {
            clearInterval(countdownInterval);
            triggerFinalEmergency();  

        }
    }, 1000);
}

// OPTION A - CANCEL
async function cancelAlert() {
  console.log("Alert cancelled!");
  stopEverything();
    // if (!currentAlertId) return;
    // const token = localStorage.getItem("token");

    // try {
    //     const response = await fetch(`${API_BASE_URL}/alerts/${currentAlertId}/cancel`, {
    //         method: "PATCH",
    //         headers: { "Authorization": `Bearer ${token}` }
    //     });

    //     if (response.ok) {
    //         stopEverything();
    //         console.log("Alert Cancelled");
    //     }
    // } catch (err) {
    //     console.error("Cancel failed", err);
    // }
}

//OPTION B - SEND MESSAGE 
async function triggerFinalEmergency() {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`${API_BASE_URL}/motionData/sendMessage`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
            alert("Emergency contacts notified!");
            stopEverything();
        }
    } catch (err) {
        console.error("Message send failed", err);
    }
    try {
      const response = await fetch(`${API_BASE_URL}/alerts`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ currentSensorData })
      });
      const result = await response.json();
      if(result.success){
          console.log("Alert data stored");
      }
      else{
        console.log("Alert data NOT STORED!");
      }
      
  } catch (err) {
      console.error("Failed to start alert sequence", err);
  }
}

function stopEverything() {
    clearInterval(countdownInterval);
    document.getElementById('emergency-overlay').classList.add('hidden');
    currentAlertId = null;
}

