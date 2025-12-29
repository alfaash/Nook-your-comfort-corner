# 🌿 Nook - Your Comfort Corner

> **An intelligent wellness companion that bridges the gap between digital work and physical well-being.**

## 📖 About The Project
**Nook** is a web-based mobile application designed to monitor your physical environment and mental state in real-time. By leveraging device sensors (accelerometer & gyroscope) and Microsoft Azure AI, Nook detects posture fatigue, movement anomalies, and anxiety-induced jitter, transforming your workspace into a true "comfort corner."

Unlike standard fitness trackers, Nook focuses on **"Ambient Wellness"**—monitoring your well-being non-intrusively while you work or study, providing empathetic nudges and emergency alerts when needed.

## ✨ Key Features
* **📍 Real-Time Motion Analysis:** Captures device motion data at 60Hz, averages it locally to preserve privacy, and detects posture shifts or sudden falls.
* **🧠 AI Anomaly Detection:** Integrates **Azure Anomaly Detector** to identify irregular movement patterns indicative of high stress or physical distress.
* **🎙️ Voice Journaling:** Uses **Azure AI Speech** and **Language Services** to analyze the sentiment of daily audio logs.
* **🛡️ Automated Safety Net:** Instantly notifies emergency contacts via SMS if a severe anomaly (e.g., a fall) is detected.
* **🔐 Secure & Private:** built with JWT Dual-Token authentication and password encryption.

## 🛠️ Tech Stack

### Backend
* **Runtime:** Node.js & Express.js
* **Database:** MongoDB, Cloudinary
* **Authentication:** JWT & Bcryptjs
* **Validation:** Mongoose Middleware

### AI & Cloud (Microsoft Azure)
* ☁️ **Azure Anomaly Detector:** For identifying motion irregularities.
* ☁️ **Azure AI Speech:** For converting voice journals to text.
* ☁️ **Gemini API:** For generating empathetic, context-aware user feedback.
* ☁️ **Azure Communication Services:** For sending alerts to emergency contacts.

### Frontend
* **Core:** HTML5 / CSS / Bootstrap5 / JavaScript
* **Data Handling:** Client-side "Bucket" buffering to optimize network requests.

## ⚙️ Architecture Workflow
1. **Data Collection:** Frontend captures Accelerometer/Gyroscope data.
2. **Preprocessing:** Data is averaged every 10 seconds to filter noise.
3. **Transmission:** Secure API calls send batched data to the Node.js backend.
4. **Analysis:** Backend relays data to Azure Anomaly Detector; simultaneous storage in MongoDB.
5. **Feedback:** If an anomaly is found, an alert is pushed to the client or emergency contacts.

## 🚀 Getting Started

### Prerequisites
* Node.js
* MongoDB (Local or Atlas URI)


### Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/yourusername/nook-backend.git](https://github.com/yourusername/nook-backend.git)
   cd Project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory and add the following:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_key_32_chars_min
   JWT_LIFETIME=30d
   CLOUDINARY_CLOUD_NAME= your_cloudinary_cloud_name
   CLOUDINARY_API_KEY= your_cloudinary_api_key
   CLOUDINARY_API_SECRET= your_cloudinary_api_secret
   AZURE_SPEECH_KEY = your_azure_speech_key
   AZURE_SPEECH_REGION = your_azure_speech_region
   AZURE_LANGUAGE_KEY = your_azure_language_key
   AZURE_LANGUAGE_ENDPOINT =   your_azure_language_endpoint
   GEMINI_API_KEY = your_gemini_api_key
   ```

4. **Run the Server**
   ```bash
   npm start
   ```

## 🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.
