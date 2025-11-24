// ---------- State ----------
let tasks = [];
let currentFilter = "all";

// Load from localStorage on startup
document.addEventListener("DOMContentLoaded", () => {
    const saved = localStorage.getItem("tasks");
    if (saved) {
        try {
            tasks = JSON.parse(saved);
        } catch (e) {
            tasks = [];
        }
    }
    attachEventListeners();
    renderTasks();
});

// ---------- Helpers ----------
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function createTask(text) {
    return {
        id: Date.now().toString(),
        text: text.trim(),
        completed: false,
        createdAt: new Date().toISOString()
    };
}

function formatTime(isoString) {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ---------- Rendering ----------
function renderTasks() {
    const listEl = document.getElementById("task-list");
    listEl.innerHTML = "";

    const filtered = tasks.filter(task => {
        if (currentFilter === "active") return !task.completed;
        if (currentFilter === "completed") return task.completed;
        return true;
    });

    if (filtered.length === 0) {
        const empty = document.createElement("li");
        empty.className = "empty-state";
        empty.innerHTML = `<span>☕</span><div>No tasks here. Add one to get started.</div>`;
        listEl.appendChild(empty);
    } else {
        filtered.forEach(task => {
            const li = document.createElement("li");
            li.className = "task-item";
            if (task.completed) li.classList.add("completed");
            li.dataset.id = task.id;

            li.innerHTML = `
                <div class="task-left">
                    <input type="checkbox" class="task-checkbox" ${
                        task.completed ? "checked" : ""
                    } />
                    <div>
                        <div class="task-text">${escapeHtml(task.text)}</div>
                        <div class="task-meta">Added at ${formatTime(
                            task.createdAt
                        )}</div>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="icon-btn edit" title="Edit task">Edit</button>
                    <button class="icon-btn delete" title="Delete task">Delete</button>
                </div>
            `;
            listEl.appendChild(li);
        });
    }

    updateStats();
}

function updateStats() {
    const countEl = document.getElementById("task-count");
    const total = tasks.length;
    const remaining = tasks.filter(t => !t.completed).length;

    if (total === 0) {
        countEl.textContent = "No tasks";
    } else if (remaining === 0) {
        countEl.textContent = `${total} tasks • All done 🎯`;
    } else {
        countEl.textContent = `${remaining} of ${total} tasks remaining`;
    }
}

function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

// ---------- Event Listeners ----------
function attachEventListeners() {
    const inputEl = document.getElementById("task-input");
    const addBtn = document.getElementById("add-task-btn");
    const listEl = document.getElementById("task-list");
    const filterButtons = document.querySelectorAll(".filter-btn");
    const clearCompletedBtn = document.getElementById("clear-completed-btn");

    addBtn.addEventListener("click", () => {
        handleAddTask();
    });

    inputEl.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            handleAddTask();
        }
    });

    // Event delegation for checkbox, edit, delete
    listEl.addEventListener("click", e => {
        const li = e.target.closest(".task-item");
        if (!li) return;
        const id = li.dataset.id;

        if (e.target.classList.contains("task-checkbox")) {
            toggleTaskCompleted(id);
        } else if (e.target.classList.contains("edit")) {
            editTask(id);
        } else if (e.target.classList.contains("delete")) {
            deleteTask(id);
        }
    });

    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            document
                .querySelector(".filter-btn.active")
                ?.classList.remove("active");
            btn.classList.add("active");
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });

    clearCompletedBtn.addEventListener("click", () => {
        const hasCompleted = tasks.some(t => t.completed);
        if (!hasCompleted) return;

        if (confirm("Clear all completed tasks?")) {
            tasks = tasks.filter(t => !t.completed);
            saveTasks();
            renderTasks();
        }
    });
}

// ---------- Actions ----------
function handleAddTask() {
    const inputEl = document.getElementById("task-input");
    const value = inputEl.value.trim();
    if (!value) {
        inputEl.focus();
        return;
    }

    tasks.unshift(createTask(value)); // add to top
    saveTasks();
    renderTasks();
    inputEl.value = "";
    inputEl.focus();
}

function toggleTaskCompleted(id) {
    tasks = tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasks();
    renderTasks();
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newText = prompt("Edit task:", task.text);
    if (newText === null) return; // cancelled

    const trimmed = newText.trim();
    if (!trimmed) return;

    tasks = tasks.map(t =>
        t.id === id ? { ...t, text: trimmed } : t
    );
    saveTasks();
    renderTasks();
}

function deleteTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const ok = confirm(`Delete task: "${task.text}"?`);
    if (!ok) return;

    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
}

// ---------- Clock ----------
function updateClock() {
    const now = new Date();
    const options = {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    };
    const timeString = now.toLocaleTimeString("en-IN", options);
    const clockEl = document.getElementById("clock");
    if (clockEl) clockEl.textContent = timeString;
}

setInterval(updateClock, 1000);
updateClock();

// ---------- Theme Toggle ----------
const themeToggleBtn = document.getElementById("theme-toggle");
if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
    });
}