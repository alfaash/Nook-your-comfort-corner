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
document.getElementById("nextMonth").onclick = () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); };