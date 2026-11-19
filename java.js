
const API = "/api/tasks";

let tasks = [];

const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("search");
const filterSelect = document.getElementById("filter");

async function request(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
    }

    return data;
}

async function loadTasks() {
    try {
        tasks = await request(API);
        renderTasks();
        updateStats();
    } catch (error) {
        taskList.textContent = error.message;
    }
}

taskForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const task = {
        title: document.getElementById("title").value.trim(),
        subject: document.getElementById("subject").value.trim(),
        due_date: document.getElementById("dueDate").value,
        priority: document.getElementById("priority").value
    };

    try {
        await request(API, {
            method: "POST",
            body: JSON.stringify(task)
        });

        taskForm.reset();
        document.getElementById("priority").value = "Medium";

        await loadTasks();
    } catch (error) {
        alert(error.message);
    }
});

function renderTasks() {
    const search = searchInput.value.toLowerCase();
    const filter = filterSelect.value;

    const filtered = tasks.filter(task => {
        const matchesSearch =
            task.title.toLowerCase().includes(search) ||
            task.subject.toLowerCase().includes(search);

        const matchesFilter =
            filter === "all" ||
            (filter === "pending" && !task.completed) ||
            (filter === "completed" && task.completed);

        return matchesSearch && matchesFilter;
    });

    taskList.replaceChildren();

    if (filtered.length === 0) {
        const message = document.createElement("p");
        message.textContent = "No tasks found. Add a new task!";
        taskList.appendChild(message);
        return;
    }

    filtered.forEach(task => {
        const card = document.createElement("div");
        card.className = `task-card ${task.completed ? "done" : ""}`;

        const details = document.createElement("div");

        const title = document.createElement("h3");
        title.textContent = task.title;

        const subject = document.createElement("p");
        subject.textContent = "Subject: " + task.subject;

        const dueDate = document.createElement("p");
        dueDate.textContent = "Due: " + (task.due_date || "Not set");

        const priority = document.createElement("p");
        priority.className = "priority " + task.priority;
        priority.textContent = task.priority + " Priority";

        details.append(title, subject, dueDate, priority);

        const actions = document.createElement("div");
        actions.className = "actions";

        const toggle = document.createElement("button");
        toggle.textContent = task.completed ? "Undo" : "Complete";
        toggle.addEventListener("click", () => toggleTask(task));

        const edit = document.createElement("button");
        edit.textContent = "Edit";
        edit.addEventListener("click", () => editTask(task));

        const remove = document.createElement("button");
        remove.textContent = "Delete";
        remove.className = "delete";
        remove.addEventListener("click", () => deleteTask(task.id));

        actions.append(toggle, edit, remove);
        card.append(details, actions);
        taskList.appendChild(card);
    });
}

async function toggleTask(task) {
    try {
        await request(`${API}/${task.id}`, {
            method: "PUT",
            body: JSON.stringify({
                completed: task.completed ? 0 : 1
            })
        });

        await loadTasks();
    } catch (error) {
        alert(error.message);
    }
}

async function editTask(task) {
    const title = prompt("Enter new task title:", task.title);
    if (title === null) return;

    const subject = prompt("Enter subject:", task.subject);
    if (subject === null) return;

    if (!title.trim() || !subject.trim()) {
        alert("Title and subject cannot be empty.");
        return;
    }

    try {
        await request(`${API}/${task.id}`, {
            method: "PUT",
            body: JSON.stringify({
                title: title.trim(),
                subject: subject.trim()
            })
        });

        await loadTasks();
    } catch (error) {
        alert(error.message);
    }
}

async function deleteTask(id) {
    if (!confirm("Are you sure you want to delete this task?")) {
        return;
    }

    try {
        await request(`${API}/${id}`, {
            method: "DELETE"
        });

        await loadTasks();
    } catch (error) {
        alert(error.message);
    }
}

function updateStats() {
    const completed = tasks.filter(task => task.completed).length;
    const pending = tasks.length - completed;

    document.getElementById("totalTasks").textContent = tasks.length;
    document.getElementById("completedTasks").textContent = completed;
    document.getElementById("pendingTasks").textContent = pending;
}

searchInput.addEventListener("input", renderTasks);
filterSelect.addEventListener("change", renderTasks);

loadTasks();
