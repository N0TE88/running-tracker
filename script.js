let runs = JSON.parse(localStorage.getItem("runs")) || [];
let goal = JSON.parse(localStorage.getItem("goal")) || 0;
let streak = JSON.parse(localStorage.getItem("streak")) || 0;

let distanceChart;
let paceChart;

// 🔐 LOGIN
function login() {
    let user = document.getElementById("username").value;
    let pass = document.getElementById("password").value;

    if (!user || !pass) {
        alert("Fill credentials");
        return;
    }

    document.getElementById("loginPage").style.display = "none";
    document.getElementById("app").style.display = "flex";
}

// 🧭 ROUTER
function showPage(page) {

    setRadio("radio-" + page);

    let content = document.getElementById("content");

    // fade out
    content.style.opacity = 0;
    content.style.transform = "translateY(10px)";

    setTimeout(() => {

        // RUN YOUR EXISTING PAGE LOGIC HERE
        if (page === "runs") {
            content.innerHTML = `
                <h2>🏃 Runs</h2>
                <input id="distance" placeholder="Distance km">
                <input id="time" placeholder="Time min">
                <input id="date" type="date">
                <button onclick="addRun()">Add Run</button>
                <ul id="runList"></ul>
            `;
            displayRuns();
        }

        if (page === "charts") {
            content.innerHTML = `
                <h2>📊 Charts</h2>
                <canvas id="runChart"></canvas>
                <canvas id="paceChart"></canvas>
            `;
            updateCharts();
        }

        if (page === "stats") {
            content.innerHTML = `
                <h2>📈 Stats</h2>
                <p id="totalDistance"></p>
                <p id="avgPace"></p>
            `;
            updateStats();
        }

        if (page === "goals") {
            content.innerHTML = `
                <h2>🎯 Goals</h2>
                <input id="goalInput" type="number">
                <button onclick="setGoal()">Set Goal</button>
                <p id="goalText"></p>
                <progress id="goalProgress" value="0" max="100"></progress>
            `;
            updateGoal();
        }

        if (page === "streak") {
            content.innerHTML = `
                <h2>🔥 Streak</h2>
                <p id="streakText"></p>
            `;
            updateStreak();
        }

        // fade in
        content.classList.remove("page");
        void content.offsetWidth; // restart animation
        content.classList.add("page");

        content.style.opacity = 1;
        content.style.transform = "translateY(0)";

    }, 150);
}

// 🏃 RUNS
content.innerHTML = `
<div class="page">

    <h2>🏃 Running Dashboard</h2>

    <div class="grid">

        <div class="card">
            <h3>Add Run</h3>
            <input id="distance" placeholder="Distance km">
            <input id="time" placeholder="Time min">
            <input id="date" type="date">
            <button onclick="addRun()">Add</button>
        </div>

        <div class="card">
            <h3>Quick Stats</h3>
            <p id="totalDistance"></p>
            <p id="avgPace"></p>
        </div>

    </div>

    <div class="card">
        <h3>Recent Runs</h3>
        <ul id="runList"></ul>
    </div>

</div>
`;
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

    localStorage.setItem("runs", JSON.stringify(runs));
    displayRuns();
}

function displayRuns() {
    let list = document.getElementById("runList");
    if (!list) return;

    list.innerHTML = "";

    runs.forEach(r => {
        let li = document.createElement("li");
        li.innerHTML = `
            ${r.date} - ${r.distance}km (${r.time}min)
            <button onclick="deleteRun(${r.id})">❌</button>
        `;
        list.appendChild(li);
    });
}

function deleteRun(id) {
    runs = runs.filter(r => r.id !== id);
    localStorage.setItem("runs", JSON.stringify(runs));
    displayRuns();
}

// 📊 STATS
function updateStats() {
    let total = runs.reduce((s, r) => s + r.distance, 0);
    let avg = runs.length ? runs.reduce((s, r) => s + r.time, 0) / total : 0;

    let t = document.getElementById("totalDistance");
    let a = document.getElementById("avgPace");

    if (t) t.innerText = `Total: ${total.toFixed(1)} km`;
    if (a) a.innerText = `Avg pace: ${avg.toFixed(2)} min/km`;
}

// 📊 CHARTS
function updateCharts() {
    let labels = runs.map(r => r.date);

    let dist = runs.map(r => r.distance);
    let pace = runs.map(r => r.pace);

    if (distanceChart) distanceChart.destroy();
    if (paceChart) paceChart.destroy();

    let ctx1 = document.getElementById("runChart")?.getContext("2d");
    let ctx2 = document.getElementById("paceChart")?.getContext("2d");

    if (!ctx1 || !ctx2) return;

    distanceChart = new Chart(ctx1, {
        type: "line",
        data: {
            labels,
            datasets: [{ label: "Distance", data: dist }]
        }
    });

    paceChart = new Chart(ctx2, {
        type: "line",
        data: {
            labels,
            datasets: [{ label: "Pace", data: pace }]
        }
    });
}

// 🎯 GOAL
function setGoal() {
    goal = Number(document.getElementById("goalInput").value);
    localStorage.setItem("goal", JSON.stringify(goal));
    updateGoal();
}

function updateGoal() {
    let total = runs.reduce((s, r) => s + r.distance, 0);
    let percent = goal ? (total / goal) * 100 : 0;

    document.getElementById("goalText").innerText =
        `Goal: ${total.toFixed(1)} / ${goal} km`;

    document.getElementById("goalProgress").value = percent;
}

// 🔥 STREAK (WEEKLY)
function updateStreak() {
    if (!goal || runs.length === 0) {
        document.getElementById("streakText").innerText =
            "🔥 Set a goal to track streak";
        return;
    }

    let today = new Date();

    // helper: get runs in a 7-day window ending at a date
    function getWeekTotal(endDate) {
        let end = new Date(endDate);
        let start = new Date(end);
        start.setDate(end.getDate() - 7);

        return runs
            .filter(r => {
                let d = new Date(r.date);
                return d > start && d <= end;
            })
            .reduce((sum, r) => sum + Number(r.distance), 0);
    }

    let streakCount = 0;

    // check last 8 weeks max
    for (let i = 0; i < 8; i++) {
        let weekEnd = new Date();
        weekEnd.setDate(today.getDate() - i * 7);

        let total = getWeekTotal(weekEnd);

        if (total >= goal) {
            streakCount++;
        } else {
            break; // streak stops
        }
    }

    streak = streakCount;
    localStorage.setItem("streak", JSON.stringify(streak));

    let message = "";

    if (streak === 0) {
        message = "No active streak yet ❌";
    } else if (streak < 2) {
        message = "Good start 🔥";
    } else if (streak < 4) {
        message = "Strong consistency 💪";
    } else {
        message = "Elite discipline 🏆";
    }

    document.getElementById("streakText").innerHTML =
        `🔥 ${streak} week streak<br><p>${message}</p>`;
}
function setNav(id) {
    document.getElementById(id).checked = true;
}
function setRadio(id) {
    document.getElementById(id).checked = true;
}
function toggleDarkMode() {
    document.body.classList.toggle("dark");

    localStorage.setItem(
        "darkMode",
        document.body.classList.contains("dark")
    );
}

// load saved mode
window.onload = function () {
    if (localStorage.getItem("darkMode") === "true") {
        document.body.classList.add("dark");
        let toggle = document.querySelector(".input");
        if (toggle) toggle.checked = true;
    }
};