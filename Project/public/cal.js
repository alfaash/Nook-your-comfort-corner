<<<<<<< HEAD
const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");
const recordingsList = document.getElementById("recordingsList");
const selectedDateText = document.getElementById("selectedDateText");

let currentDate = new Date();

// --- 1. RUN IMMEDIATELY ON LOAD ---
window.onload = () => {
    renderCalendar();
    loadAllRecordings(); 
};

// --- 2. THE MASTER LIST (ALL DATES) ---
function loadAllRecordings() {
    selectedDateText.innerText = "All My Rants";
    recordingsList.innerHTML = "";
    
    const allData = JSON.parse(localStorage.getItem("recordings")) || {};
    let masterList = [];

    // Collect every recording from every date key
    for (const dateKey in allData) {
        allData[dateKey].forEach((rec, index) => {
            masterList.push({ ...rec, dateKey, originalIndex: index });
        });
    }

    // Sort newest to oldest
    masterList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (masterList.length === 0) {
        recordingsList.innerHTML = `<p class="empty-msg">No rants recorded yet. 🍃</p>`;
        return;
    }

    masterList.forEach(rec => createCard(rec, rec.dateKey, rec.originalIndex));
}

// --- 3. FILTER BY DATE ---
function loadRecordingsForDate(date) {
    selectedDateText.innerText = `Rants from ${date}`;
    recordingsList.innerHTML = "";
    
    const allData = JSON.parse(localStorage.getItem("recordings")) || {};
    const dayData = allData[date] || [];

    if (dayData.length === 0) {
        recordingsList.innerHTML = `<p class="empty-msg">Nothing found for this day. 🍃</p>`;
        return;
    }

    dayData.forEach((rec, index) => createCard(rec, date, index));
}

// --- 4. REUSABLE CARD UI ---
function createCard(rec, date, index) {
    const time = new Date(rec.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const card = document.createElement("div");
    card.className = "recording-card";
    card.innerHTML = `
        <div class="rec-info">
            <span>${date} | ${time}</span>
            <span>${rec.duration}s</span>
        </div>
        <audio controls src="${rec.audio}"></audio>
        <button class="delete-btn" onclick="deleteRec('${date}', ${index})">Delete</button>
    `;
    recordingsList.appendChild(card);
}

// --- 5. CALENDAR LOGIC ---
function renderCalendar() {
    calendar.innerHTML = "";
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    monthYear.innerText = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    // Header Day Names
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(d => {
        const div = document.createElement("div");
        div.className = "day-name"; div.innerText = d;
        calendar.appendChild(div);
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) calendar.appendChild(document.createElement("div"));

    for (let day = 1; day <= daysInMonth; day++) {
        const dateBox = document.createElement("div");
        dateBox.className = "calendar-day";
        dateBox.innerText = day;
        const fullDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        dateBox.onclick = () => {
            document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
            dateBox.classList.add('selected');
            loadRecordingsForDate(fullDate);
        };
        calendar.appendChild(dateBox);
    }
}

// --- 6. DELETE LOGIC ---
window.deleteRec = (date, index) => {
    if (!confirm("Delete this recording?")) return;
    let allData = JSON.parse(localStorage.getItem("recordings"));
    allData[date].splice(index, 1);
    if (allData[date].length === 0) delete allData[date];
    localStorage.setItem("recordings", JSON.stringify(allData));
    
    // Refresh current view
    if (selectedDateText.innerText === "All My Rants") loadAllRecordings();
    else loadRecordingsForDate(date);
};

document.getElementById("prevMonth").onclick = () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); };
=======
const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");
const recordingsList = document.getElementById("recordingsList");
const selectedDateText = document.getElementById("selectedDateText");

let currentDate = new Date();
let allFetchedJournals = []; 

// --- 1. RUN IMMEDIATELY ON LOAD ---
window.onload = async () => {
    renderCalendar();
    await fetchJournalsFromBackend(); 
};

// --- 2. FETCH FROM BACKEND ---
async function fetchJournalsFromBackend() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('/api/v1/journal', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        allFetchedJournals = data.journals || [];
        displayRecordings(allFetchedJournals);
    } catch (err) {
        console.error("Fetch Error:", err);
        recordingsList.innerHTML = `<p class="empty-msg">Error connecting to your archives. </p>`;
    }
}

// --- 3. DISPLAY LOGIC ---
function displayRecordings(list, filterTitle = "All My Rants") {
    selectedDateText.innerText = filterTitle;
    recordingsList.innerHTML = "";

    if (list.length === 0) {
        recordingsList.innerHTML = `<p class="empty-msg">No rants found. </p>`;
        return;
    }

    list.forEach(journal => createCard(journal));
}

// --- 4. REUSABLE CARD UI (Now with AI Response & Sentiment) ---
function createCard(journal) {
    const dateObj = new Date(journal.timestamp);
    const dateStr = dateObj.toLocaleDateString();
    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Determine sentiment emoji
    const emoji = journal.sentimentScore > 0 ? '😊' : journal.sentimentScore < 0 ? '😔' : '😐';

    const card = document.createElement("div");
    card.className = "recording-card";
    card.innerHTML = `
        <div class="rec-info">
            <span><strong>${dateStr} | ${timeStr}</strong></span>
            <span>${journal.duration}s ${emoji}</span>
        </div>
        
        <audio controls src="${journal.audioUrl}"></audio>
        
        <div class="journal-details">
            <p><strong>Transcript:</strong> ${journal.transcript || "No transcript available"}</p>
            <p class="ai-note"><strong>AI Response:</strong> ${journal.aiResponse || "Processing..."}</p>
        </div>

        <button class="delete-btn" onclick="deleteJournal('${journal._id}')">Delete Archive</button>
    `;
    recordingsList.appendChild(card);
}

// --- 5. CALENDAR FILTERING ---
function loadRecordingsForDate(selectedDateStr) {
    const filtered = allFetchedJournals.filter(j => {
        const jDate = new Date(j.timestamp).toISOString().split('T')[0];
        return jDate === selectedDateStr;
    });

    displayRecordings(filtered, `Rants from ${selectedDateStr}`);
}

function loadAllRecordings() {
    displayRecordings(allFetchedJournals, "All My Rants");
}

// --- 6. DELETE LOGIC (Hits Backend) ---
window.deleteJournal = async (journalId) => {
    if (!confirm("Permanently delete this archive from Cloudinary and Nook?")) return;
    
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`/api/v1/journals/${journalId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            // Remove from local array and refresh
            allFetchedJournals = allFetchedJournals.filter(j => j._id !== journalId);
            loadAllRecordings();
        }
    } catch (err) {
        alert("Delete failed. Try again.");
    }
};

// --- 7. CALENDAR UI RENDER ---
function renderCalendar() {
    calendar.innerHTML = "";
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    monthYear.innerText = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(d => {
        const div = document.createElement("div");
        div.className = "day-name"; div.innerText = d;
        calendar.appendChild(div);
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) calendar.appendChild(document.createElement("div"));

    for (let day = 1; day <= daysInMonth; day++) {
        const dateBox = document.createElement("div");
        dateBox.className = "calendar-day";
        dateBox.innerText = day;
        
        // Formatting to match ISO string comparison
        const fullDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        dateBox.onclick = () => {
            document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
            dateBox.classList.add('selected');
            loadRecordingsForDate(fullDate);
        };
        calendar.appendChild(dateBox);
    }
}

document.getElementById("prevMonth").onclick = () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); };
>>>>>>> f5a7339ef1e2bf4e8ae79bb2c84004edd69907ef
document.getElementById("nextMonth").onclick = () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); };