import React, { useMemo, useState } from "react";
import "./App.css";

const PRIORITIES = {
  urgent: {
    label: "Urgent",
    short: "Now",
    dot: "🔴",
    helper: "Needs attention now",
    className: "urgent",
  },
  soon: {
    label: "Soon",
    short: "Soon",
    dot: "🟠",
    helper: "Needs action soon",
    className: "soon",
  },
  later: {
    label: "Later",
    short: "Later",
    dot: "🟢",
    helper: "When you have time",
    className: "later",
  },
};

function cleanTaskText(value) {
  return value.replace(/\s+/g, " ").trim();
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("urgent");
  const [activeView, setActiveView] = useState("all");
  const [search, setSearch] = useState("");

  const activeTasks = useMemo(() => tasks.filter((task) => !task.done), [tasks]);

  const counts = useMemo(() => {
    return {
      urgent: activeTasks.filter((task) => task.priority === "urgent").length,
      soon: activeTasks.filter((task) => task.priority === "soon").length,
      later: activeTasks.filter((task) => task.priority === "later").length,
    };
  }, [activeTasks]);

  const visibleTasks = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return tasks.filter((task) => {
      const matchesView = activeView === "all" || task.priority === activeView;
      const matchesSearch = !searchText || task.title.toLowerCase().includes(searchText);
      return matchesView && matchesSearch;
    });
  }, [tasks, activeView, search]);

  function addTask() {
    const title = cleanTaskText(newTask);
    if (!title) return;

    setTasks((current) => [
      {
        id: Date.now(),
        title,
        priority: selectedPriority,
        done: false,
      },
      ...current,
    ]);

    setNewTask("");
  }

  function toggleDone(id) {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, done: !task.done } : task))
    );
  }

  function removeTask(id) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  function changePriority(id, priority) {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, priority } : task))
    );
  }

  const currentPriority = PRIORITIES[selectedPriority];

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div className="top-pill">🧠 Busy minds need simple</div>

        <h1>What needs your attention?</h1>
        <p className="hero-copy">An empty space for the things on your mind. Sort each one by feel, not by complicated systems.</p>

        <div className="priority-grid">
          {Object.entries(PRIORITIES).map(([key, item]) => {
            const isActive = activeView === key;
            return (
              <button
                key={key}
                className={`priority-card ${item.className} ${isActive ? "active" : ""}`}
                onClick={() => setActiveView(isActive ? "all" : key)}
              >
                <span className="priority-dot">{item.dot}</span>
                <span className="priority-name">{item.short}</span>
                <strong>{counts[key]}</strong>
                <small>{item.helper}</small>
              </button>
            );
          })}
        </div>
      </section>

      <section className="add-card">
        <div className="input-wrap">
          <input
            value={newTask}
            onChange={(event) => setNewTask(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") addTask();
            }}
            placeholder="Type one thing on your mind..."
            autoFocus
          />
          <button className="add-button" onClick={addTask}>Add</button>
        </div>

        <div className="priority-picker" aria-label="Choose urgency">
          {Object.entries(PRIORITIES).map(([key, item]) => (
            <button
              key={key}
              className={`picker-button ${item.className} ${selectedPriority === key ? "selected" : ""}`}
              onClick={() => setSelectedPriority(key)}
            >
              {item.dot} {item.short}
            </button>
          ))}
        </div>

        <p className={`selected-message ${currentPriority.className}`}>
          This will be added as: <strong>{currentPriority.dot} {currentPriority.label}</strong> — {currentPriority.helper.toLowerCase()}.
        </p>
      </section>

      <section className="tools-row">
        <div className="search-box">
          <span>⌕</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tasks"
          />
        </div>

        <button className="plain-button" onClick={() => setActiveView("all")}>Show everything</button>
      </section>

      <section className="task-list">
        {visibleTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">○</div>
            <h2>Clear mind.</h2>
            <p>Add one thing above. Keep it simple.</p>
          </div>
        ) : (
          visibleTasks.map((task) => {
            const item = PRIORITIES[task.priority];
            return (
              <article key={task.id} className={`task-card ${item.className} ${task.done ? "done" : ""}`}>
                <button className="done-button" onClick={() => toggleDone(task.id)}>
                  {task.done ? "✓" : "○"}
                </button>

                <div className="task-content">
                  <div className="task-label">{item.dot} {item.label}</div>
                  <p>{task.title}</p>

                  <div className="task-actions">
                    {Object.entries(PRIORITIES).map(([key, option]) => (
                      <button
                        key={key}
                        className={`mini-priority ${option.className} ${task.priority === key ? "selected" : ""}`}
                        onClick={() => changePriority(task.id, key)}
                      >
                        {option.short}
                      </button>
                    ))}
                  </div>
                </div>

                <button className="delete-button" onClick={() => removeTask(task.id)}>×</button>
              </article>
            );
          })
        )}
      </section>
    </main>
  );
}
