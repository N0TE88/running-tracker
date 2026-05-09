let watchId = null;
let liveRoute = [];
let livePolyline = null;
let liveMap = null;
let runs = JSON.parse(localStorage.getItem("runs")) || [];
let goal = Number(localStorage.getItem("goal")) || 0;
let streak = Number(localStorage.getItem("streak")) || 0;

let distanceChart;
let paceChart;

/* =========================
   LOGIN
========================= */
window.login = function () {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        alert("Please fill all fields");
        return;
    }

    const btn = document.querySelector(".login-card button");
    btn.innerText = "Signing in...";

    setTimeout(() => {
        localStorage.setItem("user", username);

        document.getElementById("loginPage").style.display = "none";
        document.getElementById("app").style.display = "flex";

        showPage("home");
    }, 700);
};

/* =========================
   ROUTER
========================= */
function showPage(page) {
    const content = document.getElementById("content");
    if (!content) return;

    setRadio("radio-" + page);

    content.style.opacity = 0;
    content.style.transform = "translateY(10px)";

    setTimeout(() => {

        if (page === "home") {
            content.innerHTML = homeUI();
            refreshHome();
        }

        if (page === "runs") {
            content.innerHTML = runsUI();
            displayRuns();
        }

        if (page === "charts") {
            content.innerHTML = chartsUI();
            updateCharts();
        }

        if (page === "stats") {
            content.innerHTML = statsUI();
            refreshStats();
        }

        if (page === "goals") {
            content.innerHTML = goalsUI();
            refreshGoal();
        }

        if (page === "streak") {
            content.innerHTML = streakUI();
            refreshStreak();
        }
       if (page === "map") {
    content.innerHTML = `
        <h2>🗺️ Live Run Tracker</h2>

        <div class="card">
            <button onclick="startRun()">▶ Start Run</button>
            <button onclick="stopRun()">⏹ Stop Run</button>
            <p id="gpsStatus">GPS idle</p>
            <div id="map" style="height:320px;border-radius:12px;"></div>
        </div>
    `;

    setTimeout(initLiveMap, 100);
}

        content.style.opacity = 1;
        content.style.transform = "translateY(0)";

    }, 120);
}
function initLiveMap() {
    if (liveMap) {
        liveMap.remove();
    }

    liveMap = L.map('map').setView([36.8, 10.18], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: ''
    }).addTo(liveMap);

    liveRoute = [];

    livePolyline = L.polyline([], {
        color: "#ff4d4d",
        weight: 4
    }).addTo(liveMap);
}
function startRun() {
    if (!navigator.geolocation) {
        alert("GPS not supported");
        return;
    }

    document.getElementById("gpsStatus").innerText = "Tracking live run...";

    liveRoute = [];

    watchId = navigator.geolocation.watchPosition(
        (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;

            const point = [lat, lng];
            liveRoute.push(point);

            livePolyline.setLatLngs(liveRoute);
            liveMap.setView(point, 16);

            // marker (latest position)
            L.circleMarker(point, {
                radius: 6,
                color: "white",
                fillColor: "#ff4d4d",
                fillOpacity: 1
            }).addTo(liveMap);
        },
        (err) => {
            document.getElementById("gpsStatus").innerText =
                "GPS error: " + err.message;
        },
        {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 5000
        }
    );
}
function stopRun() {
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }

    document.getElementById("gpsStatus").innerText = "Run stopped";

    if (liveRoute.length > 1) {
        const distance = calculateDistance(liveRoute);

        runs.push({
            id: Date.now(),
            distance: distance.toFixed(2),
            time: 0,
            pace: 0,
            date: new Date().toISOString().split("T")[0],
            route: liveRoute
        });

        localStorage.setItem("runs", JSON.stringify(runs));
    }
}
function calculateDistance(route) {
    let total = 0;

    for (let i = 1; i < route.length; i++) {
        total += getDistanceFromLatLon(
            route[i-1][0], route[i-1][1],
            route[i][0], route[i][1]
        );
    }

    return total;
}

function getDistanceFromLatLon(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);

    const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon/2) * Math.sin(dLon/2);

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
}


/* =========================
   UI TEMPLATES
========================= */

function homeUI() {
    return `
<div class="dashboard">

    <!-- TOP HERO -->
    <div class="topbar">
        <div>
            <p class="welcome">WELCOME BACK</p>
            <h1>Raslene 👋</h1>
        </div>

        <div class="profile-circle">
            🏃
        </div>
    </div>

    <!-- HERO CARD -->
    <div class="hero premium-hero">

        <div class="hero-overlay"></div>

        <div class="hero-content">
            <span class="live-badge">● LIVE FITNESS</span>

            <h2 id="heroMsg">
                Strong consistency 🔥
            </h2>

            <p>
                Keep building your endurance and pace.
            </p>

            <div class="hero-stats">
                <div>
                    <span>Weekly Distance</span>
                    <h3 id="weekDistance">0 km</h3>
                </div>

                <div>
                    <span>Average Pace</span>
                    <h3 id="avgPace">0 min/km</h3>
                </div>
            </div>
        </div>

    </div>

    <!-- QUICK STATS -->
    <div class="stats-grid">

        <div class="stat-card glass">
            <span>🔥 Streak</span>
            <h3 id="streakText">0 weeks</h3>
        </div>

        <div class="stat-card glass highlight-card">
            <span>🎯 Goal</span>
            <h3 id="goalText">0%</h3>
        </div>

    </div>

    <!-- CHART -->
    <div class="card premium-card">
        <div class="section-header">
            <h3>Performance Trend</h3>
            <span>Last Runs</span>
        </div>

        <canvas id="runChart"></canvas>
    </div>

</div>
`;
}

function runsUI() {
    return `
<h2>🏃 Runs</h2>

<input id="distance" placeholder="Distance (km)">
<input id="time" placeholder="Time (min)">
<input id="date" type="date">

<button onclick="addRun()">Add Run</button>

<ul id="runList"></ul>
`;
}

function chartsUI() {
    return `
<h2>📊 Charts</h2>
<canvas id="runChart"></canvas>
<canvas id="paceChart"></canvas>
`;
}

function statsUI() {
    return `
<h2>📈 Stats</h2>
<p id="totalDistance"></p>
<p id="avgPace"></p>
`;
}

function goalsUI() {
    return `
<h2>🎯 Goals</h2>

<input id="goalInput" type="number" placeholder="Weekly km goal">
<button onclick="setGoal()">Set Goal</button>

<p id="goalText"></p>
<progress id="goalProgress" max="100" value="0"></progress>
`;
}

function streakUI() {
    return `
<h2>🔥 Streak</h2>
<p id="streakText"></p>
`;
}

/* =========================
   RUNS
========================= */
function addRun() {
    let distance = Number(document.getElementById("distance").value);
    let time = Number(document.getElementById("time").value);
    let date = document.getElementById("date").value;

    if (!distance || !time || !date) return;

    runs.push({
        id: Date.now(),
        distance,
        time,
        pace: (time / distance).toFixed(2),
        date
    });

    save();
    displayRuns();
    refreshAll();
}

function displayRuns() {
    const list = document.getElementById("runList");
    if (!list) return;

    list.innerHTML = "";

    runs.forEach(r => {
        const li = document.createElement("li");
        li.innerHTML = `
            ${r.date} - ${r.distance}km (${r.time}min)
            <button onclick="deleteRun(${r.id})">❌</button>
        `;
        list.appendChild(li);
    });
}

function deleteRun(id) {
    runs = runs.filter(r => r.id !== id);
    save();
    displayRuns();
    refreshAll();
}

/* =========================
   STATS CORE
========================= */
function getWeekRuns() {
    const now = new Date();

    return runs.filter(r => {
        const d = new Date(r.date);
        return (now - d) / (1000 * 60 * 60 * 24) <= 7;
    });
}

function refreshStats() {
    const total = runs.reduce((s, r) => s + r.distance, 0);
    const avg = total ? runs.reduce((s, r) => s + r.time, 0) / total : 0;

    setText("totalDistance", `Total: ${total.toFixed(1)} km`);
    setText("avgPace", `Avg: ${avg.toFixed(2)} min/km`);
}

/* =========================
   HOME DASHBOARD
========================= */

function refreshHome() {
    const week = getWeekRuns();

    const weekDist = week.reduce((s, r) => s + r.distance, 0);
    const weekTime = week.reduce((s, r) => s + r.time, 0);

    const avg = weekDist ? (weekTime / weekDist).toFixed(2) : 0;

    setText("weekDistance", `${weekDist.toFixed(1)} km`);
    setText("avgPace", `${avg} min/km`);

    setText("heroMsg", athleteMessage(weekDist));

    refreshGoal();
    refreshStreak();
    updateCharts();
}

/* =========================
   CHARTS
========================= */
function updateCharts() {
    const labels = runs.map(r => r.date);
    const dist = runs.map(r => r.distance);
    const pace = runs.map(r => r.pace);

    const c1 = document.getElementById("runChart");
    const c2 = document.getElementById("paceChart");

    if (!c1) return;

    if (distanceChart) distanceChart.destroy();
    if (paceChart) paceChart.destroy();

    distanceChart = new Chart(c1, {
        type: "line",
        data: { labels, datasets: [{ data: dist, label: "Distance" }] }
    });

    if (c2) {
        paceChart = new Chart(c2, {
            type: "line",
            data: { labels, datasets: [{ data: pace, label: "Pace" }] }
        });
    }
}

/* =========================
   GOALS
========================= */
function setGoal() {
    goal = Number(document.getElementById("goalInput").value);
    localStorage.setItem("goal", goal);
    refreshGoal();
}

function refreshGoal() {
    const total = runs.reduce((s, r) => s + r.distance, 0);
    const percent = goal ? (total / goal) * 100 : 0;

    setText("goalText", `${total.toFixed(1)} / ${goal} km`);
    const bar = document.getElementById("goalProgress");
    if (bar) bar.value = percent;
}

/* =========================
   STREAK (WEEKLY - FIXED)
========================= */
function refreshStreak() {
    if (!goal) {
        setText("streakText", "Set goal first");
        return;
    }

    let count = 0;
    const today = new Date();

    const weekTotal = (end) => {
        const start = new Date(end);
        start.setDate(end.getDate() - 7);

        return runs
            .filter(r => {
                const d = new Date(r.date);
                return d > start && d <= end;
            })
            .reduce((s, r) => s + r.distance, 0);
    };

    for (let i = 0; i < 8; i++) {
        let end = new Date();
        end.setDate(today.getDate() - i * 7);

        if (weekTotal(end) >= goal) count++;
        else break;
    }

    streak = count;
    localStorage.setItem("streak", streak);

    setText("streakText", `🔥 ${streak} week streak`);
}

/* =========================
   UX HELPERS
========================= */
function athleteMessage(km) {
    if (km === 0) return "Time to start your week 🏃";
    if (km < 10) return "Light week — build momentum";
    if (km < 25) return "Strong consistency 🔥";
    return "Elite training week 🏆";
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
}

function setRadio(id) {
    const el = document.getElementById(id);
    if (el) el.checked = true;
}

function save() {
    localStorage.setItem("runs", JSON.stringify(runs));
}

/* =========================
   INIT
========================= */
window.onload = function () {
    const user = localStorage.getItem("user");

    if (user) {
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("app").style.display = "flex";
        showPage("home");
    }
};
function initMap() {
    if (window._map) {
        window._map.remove();
    }

    window._map = L.map('map').setView([36.8, 10.18], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: ''
    }).addTo(window._map);

    // fake Strava-like run route
    const route = [
        [36.800, 10.180],
        [36.801, 10.182],
        [36.803, 10.185],
        [36.806, 10.189],
        [36.808, 10.192],
        [36.810, 10.195]
    ];

    L.polyline(route, {
        color: "#ff4d4d",
        weight: 4
    }).addTo(window._map);

    route.forEach(p => {
        L.circleMarker(p, {
            radius: 5,
            color: "white",
            fillColor: "#ff4d4d",
            fillOpacity: 1
        }).addTo(window._map);
    });
}
function setPage(el, page) {
    document.querySelectorAll(".nav-item").forEach(n => {
        n.classList.remove("active");
    });

    el.classList.add("active");
}
function nav(el, page) {
    document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
    el.classList.add("active");
    showPage(page);
}