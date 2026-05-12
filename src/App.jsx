import React, { useMemo, useState } from "react";

const PRIORITIES = {
  urgent: {
    label: "Urgent",
    short: "Now",
    colour: "bg-red-500",
    soft: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    dot: "🔴",
    helper: "Needs attention now",
  },
  soon: {
    label: "Soon",
    short: "Soon",
    colour: "bg-orange-400",
    soft: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    dot: "🟠",
    helper: "Needs action soon",
  },
  later: {
    label: "Later",
    short: "Later",
    colour: "bg-green-500",
    soft: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    dot: "🟢",
    helper: "When you have time",
  },
};

const STARTER_TASKS = [
  {
    id: 1,
    title: "Reply to Joe about Park & Ride parking",
    priority: "urgent",
    done: false,
  },
  {
    id: 2,
    title: "Check Marini plant fabrication notes",
    priority: "soon",
    done: false,
  },
  {
    id: 3,
    title: "Print asphalt lab worksheet double-sided",
    priority: "soon",
    done: false,
  },
  {
    id: 4,
    title: "Review Tongariro shuttle wording",
    priority: "later",
    done: false,
  },
];

function cleanTaskText(value) {
  return value.replace(/\s+/g, " ").trim();
}

export default function App() {
  const [tasks, setTasks] = useState(STARTER_TASKS);
  const [newTask, setNewTask] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("urgent");
  const [activeView, setActiveView] = useState("all");
  const [search, setSearch] = useState("");

  const activeTasks = useMemo(() => {
    return tasks.filter((task) => !task.done);
  }, [tasks]);

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
      const matchesSearch =
        !searchText || task.title.toLowerCase().includes(searchText);

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
      current.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  }

  function removeTask(id) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  function changePriority(id, priority) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, priority } : task
      )
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-950">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm text-neutral-600 shadow-sm">
              <span className="text-base">🧠</span>
              Busy minds need simple
            </div>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              What needs your attention?
            </h1>

            <p className="mt-2 text-neutral-600">
              No folders. No clutter. Just now, soon, or later.
            </p>
          </div>
        </header>

        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {Object.entries(PRIORITIES).map(([key, item]) => {
            const isActive = activeView === key;

            return (
              <button
                key={key}
                onClick={() => setActiveView(isActive ? "all" : key)}
                className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:shadow-md ${
                  isActive
                    ? `${item.border} ring-2 ring-offset-2`
                    : "border-neutral-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`h-4 w-4 rounded-full ${item.colour}`} />
                    <span className="text-lg font-semibold">{item.short}</span>
                  </div>

                  <span className="text-3xl font-bold">{counts[key]}</span>
                </div>

                <p className="mt-2 text-sm text-neutral-600">
                  {item.helper}
                </p>
              </button>
            );
          })}
        </div>

        <div className="mb-5 rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="p-4">
            <div className="flex flex-col gap-3 lg:flex-row">
              <input
                value={newTask}
                onChange={(event) => setNewTask(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") addTask();
                }}
                placeholder="Type one thing on your mind..."
                className="min-h-12 flex-1 rounded-xl border border-neutral-200 bg-white px-4 text-base outline-none focus:ring-2 focus:ring-neutral-300"
              />

              <div className="grid grid-cols-3 gap-2 lg:w-96">
                {Object.entries(PRIORITIES).map(([key, item]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedPriority(key)}
                    className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                      selectedPriority === key
                        ? `${item.soft} ${item.border} ${item.text}`
                        : "border-neutral-200 bg-white text-neutral-600"
                    }`}
                  >
                    {item.dot} {item.short}
                  </button>
                ))}
              </div>

              <button
                onClick={addTask}
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-neutral-950 px-5 font-medium text-white transition hover:bg-neutral-800"
              >
                <span className="mr-2">+</span>
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 shadow-sm sm:w-80">
            <span className="text-neutral-400">⌕</span>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <button
            onClick={() => setActiveView("all")}
            className="text-sm font-medium text-neutral-500 hover:text-neutral-900"
          >
            Show everything
          </button>
        </div>

        <div className="space-y-3">
          {visibleTasks.map((task) => {
            const item = PRIORITIES[task.priority];

            return (
              <div
                key={task.id}
                className={`rounded-2xl border bg-white p-4 shadow-sm ${
                  task.done ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleDone(task.id)}
                    className="mt-1 text-neutral-500"
                  >
                    {task.done ? (
                      <span className="text-xl">✓</span>
                    ) : (
                      <span className="text-xl">○</span>
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`h-3 w-3 rounded-full ${item.colour}`}
                      />

                      <span
                        className={`text-xs font-semibold uppercase tracking-wide ${item.text}`}
                      >
                        {item.label}
                      </span>
                    </div>

                    <p
                      className={`mt-1 text-lg ${
                        task.done ? "line-through" : ""
                      }`}
                    >
                      {task.title}
                    </p>
                  </div>

                  <button
                    onClick={() => removeTask(task.id)}
                    className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                  >
                    <span>×</span>
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 pl-9">
                  {Object.entries(PRIORITIES).map(([key, option]) => (
                    <button
                      key={key}
                      onClick={() => changePriority(task.id, key)}
                      className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${
                        task.priority === key
                          ? `${option.soft} ${option.border} ${option.text}`
                          : "border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50"
                      }`}
                    >
                      {option.dot} {option.short}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {visibleTasks.length === 0 && (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-neutral-500">
              Nothing here. Clear mind.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
