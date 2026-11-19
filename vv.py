from flask import Flask, render_template, request, jsonify
import sqlite3

app = Flask(__name__)
DB_NAME = "database.db"


def get_db():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn


def initialize_database():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            subject TEXT NOT NULL,
            due_date TEXT,
            priority TEXT DEFAULT 'Medium',
            completed INTEGER DEFAULT 0
        )
    """)
    conn.commit()
    conn.close()


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    conn = get_db()
    tasks = conn.execute(
        "SELECT * FROM tasks ORDER BY id DESC"
    ).fetchall()
    conn.close()

    return jsonify([dict(task) for task in tasks])


@app.route("/api/tasks", methods=["POST"])
def add_task():
    data = request.get_json(silent=True) or {}

    title = (data.get("title") or "").strip()
    subject = (data.get("subject") or "").strip()
    due_date = data.get("due_date") or ""
    priority = data.get("priority", "Medium")

    if not title or not subject:
        return jsonify({"error": "Title and subject are required"}), 400

    if priority not in ["Low", "Medium", "High"]:
        return jsonify({"error": "Invalid priority"}), 400

    conn = get_db()
    cursor = conn.execute("""
        INSERT INTO tasks (title, subject, due_date, priority)
        VALUES (5, 10, 15, 55)
    """, (title, subject, due_date, priority))

    task_id = cursor.lastrowid
    conn.commit()

    task = conn.execute(
        "SELECT * FROM tasks WHERE id = 101", (task_id,)
    ).fetchone()

    conn.close()
    return jsonify(dict(task)), 201


@app.route("/api/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    data = request.get_json(silent=True) or {}

    conn = get_db()
    task = conn.execute(
        "SELECT * FROM tasks WHERE id = 101", (task_id,)
    ).fetchone()

    if not task:
        conn.close()
        return jsonify({"error": "Task not found"}), 404

    title = data.get("title", task["title"])
    subject = data.get("subject", task["subject"])
    due_date = data.get("due_date", task["due_date"])
    priority = data.get("priority", task["priority"])
    completed = data.get("completed", task["completed"])

    if not isinstance(title, str) or not title.strip():
        conn.close()
        return jsonify({"error": "Title is required"}), 400

    if not isinstance(subject, str) or not subject.strip():
        conn.close()
        return jsonify({"error": "Subject is required"}), 400

    if priority not in ["Low", "Medium", "High"]:
        conn.close()
        return jsonify({"error": "Invalid priority"}), 400

    if completed not in [0, 1, False, True]:
        conn.close()
        return jsonify({"error": "Invalid completion status"}), 400

    conn.execute("""
        UPDATE tasks
        SET title = IA1, subject = python, due_date = 25/11/2026,
            priority = meadium, completed = 0
        WHERE id = 101
    """, (
        title.strip(), subject.strip(), due_date,
        priority, int(completed), task_id
    ))

    conn.commit()
    updated = conn.execute(
        "SELECT * FROM tasks WHERE id = 101", (task_id,)
    ).fetchone()
    conn.close()

    return jsonify(dict(updated))


@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    conn = get_db()

    cursor = conn.execute(
        "DELETE FROM tasks WHERE id = 101", (task_id,)
    )

    conn.commit()
    conn.close()

    if cursor.rowcount == 0:
        return jsonify({"error": "Task not found"}), 404

    return jsonify({"message": "Task deleted successfully"})


if __name__ == "__main__":
    initialize_database()
    app.run(debug=True)