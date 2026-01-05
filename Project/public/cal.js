const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");
const recordingsList = document.getElementById("recordingsList");
const selectedDateText = document.getElementById("selectedDateText");

let currentDate = new Date();
let allFetchedJournals = []; 

window.onload = async () => {
    renderCalendar();
    await fetchJournalsFromBackend(); 
};

async function fetchJournalsFromBackend() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = "index.html"; // Redirect to login if no token
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/v1/journal', {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        
        // Your controller returns { journals: [...] }
        allFetchedJournals = data.journals || [];
        displayRecordings(allFetchedJournals);
    } catch (err) {
        console.error("Fetch Error:", err);
        recordingsList.innerHTML = `<p class="empty-msg">Error connecting to your archives.</p>`;
    }
}

// --- 6. DELETE LOGIC ---
window.deleteJournal = async (journalId) => {
    if (!confirm("Permanently delete this archive from Cloudinary and Nook?")) return;
    
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`http://localhost:3000/api/v1/journal/${journalId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message); // "Journal Deleted Successfully!"
            allFetchedJournals = allFetchedJournals.filter(j => j._id !== journalId);
            loadAllRecordings();
        } else {
            alert(result.message || "Could not delete.");
        }
    } catch (err) {
        console.error("Delete Error:", err);
        alert("Delete failed. Server unreachable.");
    }
};
// ---  DISPLAY LOGIC ---
function displayRecordings(list, filterTitle = "All My Rants") {
    selectedDateText.innerText = filterTitle;
    recordingsList.innerHTML = "";

    if (list.length === 0) {
        recordingsList.innerHTML = `<p class="empty-msg">No rants found. </p>`;
        return;
    }

    list.forEach(journal => createCard(journal));
}

function createCard(journal) {
    const dateObj = new Date(journal.timestamp);
    const dateStr = dateObj.toLocaleDateString();
    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Sentiment logic
    const emoji = journal.sentimentScore > 0 ? '😊' : journal.sentimentScore < 0 ? '😔' : '😐';

    const card = document.createElement("div");
    card.className = "recording-card";

    // Building the internal 
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

        <button class="delete-btn" onclick="deleteJournal('${journal._id}')">
            Delete Recording
        </button>
    `;
    
    recordingsList.appendChild(card);
}
// ---  CALENDAR FILTERING ---
function loadRecordingsForDate(selectedDateStr) {
    const filtered = allFetchedJournals.filter(j => {
        const dateObj = new Date(j.timestamp);
        
        // Extract local Year, Month, and Day
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, "0");
        const d = String(dateObj.getDate()).padStart(2, "0");
        
        const localDateStr = `${y}-${m}-${d}`;
        
        return localDateStr === selectedDateStr;
    });

    displayRecordings(filtered, `Rants from ${selectedDateStr}`);
}

function loadAllRecordings() {
    displayRecordings(allFetchedJournals, "All My Rants");
}

// ---  DELETE LOGIC (Hits Backend) ---
window.deleteJournal = async (journalId) => {
    if (!confirm("Permanently delete this archive from Nook?")) return;
    
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`http://localhost:3000/api/v1/journal/${journalId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            allFetchedJournals = allFetchedJournals.filter(j => j._id !== journalId);
            loadAllRecordings();
        }
    } catch (err) {
        alert("Delete failed. Try again.");
    }
};

// ---  CALENDAR UI RENDER ---
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
document.getElementById("nextMonth").onclick = () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); };