import { useEffect, useMemo, useState } from "react";

const emptyTask = {
  title: "",
  area: "",
  mission: 3,
  customer: 3,
  money: 3,
  risk: 3,
  urgency: 3,
  blocking: 3,
  reversible: 3,
  energy: 3,
};

function scoreTask(t) {
  return (
    Number(t.mission) +
    Number(t.customer) +
    Number(t.money) +
    Number(t.risk) +
    Number(t.urgency) +
    Number(t.blocking) +
    Number(t.reversible) +
    Number(t.energy)
  );
}

function classify(score) {
  if (score >= 30) return { label: "Critical Signal", action: "Do Today", color: "#050505" };
  if (score >= 24) return { label: "Strong Signal", action: "Schedule Today", color: "#12355b" };
  if (score >= 16) return { label: "Controlled Noise", action: "Batch / Delegate / Defer", color: "#b7791f" };
  return { label: "Noise", action: "Delete / Park / Automate", color: "#6b7280" };
}

export default function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("jobsListTasks");
    return saved ? JSON.parse(saved) : [];
  });

  const [form, setForm] = useState(emptyTask);

  useEffect(() => {
    localStorage.setItem("jobsListTasks", JSON.stringify(tasks));
  }, [tasks]);

  const ranked = useMemo(() => {
    return [...tasks]
      .map((t) => {
        const score = scoreTask(t);
        return { ...t, score, ...classify(score) };
      })
      .sort((a, b) => b.score - a.score);
  }, [tasks]);

  const signals = ranked.filter((t) => t.score >= 24).slice(0, 5);
  const noise = ranked.filter((t) => t.score < 24);

  function addTask() {
    if (!form.title.trim()) return;
    setTasks([...tasks, { ...form, id: Date.now() }]);
    setForm(emptyTask);
  }

  function clearAll() {
    if (confirm("Clear all tasks?")) setTasks([]);
  }

  const input = {
    width: "100%",
    padding: "14px",
    borderRadius: "14px",
    border: "1px solid #ddd",
    fontSize: "15px",
  };

  const label = {
    fontSize: "13px",
    fontWeight: "700",
    marginBottom: "6px",
    display: "block",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f3", color: "#111", fontFamily: "Inter, Arial, sans-serif" }}>
      <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "34px 18px" }}>
        
        <header style={{ background: "#fff", borderRadius: "28px", padding: "34px", boxShadow: "0 20px 60px rgba(0,0,0,0.08)", marginBottom: "24px" }}>
          <div style={{ fontSize: "13px", letterSpacing: "2px", textTransform: "uppercase", color: "#777", fontWeight: "800" }}>
            Signal Over Noise
          </div>
          <h1 style={{ fontSize: "46px", margin: "8px 0 8px", letterSpacing: "-2px" }}>
            Steve Jobs Jobs List
          </h1>
          <p style={{ fontSize: "18px", color: "#555", maxWidth: "760px", lineHeight: 1.5 }}>
            Enter every task. The system separates the few mission-critical signals from the noise, then tells you what deserves your next 18 hours.
          </p>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "24px" }}>
          {[
            ["Total Tasks", ranked.length],
            ["Signals", ranked.filter(t => t.score >= 24).length],
            ["Noise", noise.length],
            ["Focus Limit", "3–5"],
          ].map(([name, value]) => (
            <div key={name} style={{ background: "#fff", padding: "22px", borderRadius: "22px", boxShadow: "0 12px 30px rgba(0,0,0,0.06)" }}>
              <div style={{ color: "#777", fontSize: "13px", fontWeight: "700" }}>{name}</div>
              <div style={{ fontSize: "34px", fontWeight: "900", marginTop: "8px" }}>{value}</div>
            </div>
          ))}
        </section>

        <main style={{ display: "grid", gridTemplateColumns: "420px 1fr", gap: "24px" }}>
          
          <section style={{ background: "#fff", borderRadius: "28px", padding: "24px", boxShadow: "0 20px 60px rgba(0,0,0,0.08)" }}>
            <h2 style={{ marginTop: 0 }}>Add Task</h2>

            <label style={label}>Task</label>
            <input style={input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="What needs doing?" />

            <label style={{ ...label, marginTop: "14px" }}>Project / Area</label>
            <input style={input} value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="Lab, shuttle, personal, asphalt..." />

            <div style={{ marginTop: "18px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {[
                ["mission", "Mission"],
                ["customer", "User"],
                ["money", "Money"],
                ["risk", "Risk"],
                ["urgency", "Urgency"],
                ["blocking", "Blocking"],
                ["reversible", "Hard to Undo"],
                ["energy", "Deep Focus"],
              ].map(([key, name]) => (
                <div key={key}>
                  <label style={label}>{name}</label>
                  <select style={input} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}>
                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <button onClick={addTask} style={{ width: "100%", marginTop: "22px", padding: "16px", borderRadius: "18px", border: "none", background: "#111", color: "#fff", fontSize: "16px", fontWeight: "900", cursor: "pointer" }}>
              Add to Jobs List
            </button>

            <button onClick={clearAll} style={{ width: "100%", marginTop: "10px", padding: "13px", borderRadius: "18px", border: "1px solid #ddd", background: "#fff", color: "#555", fontWeight: "800", cursor: "pointer" }}>
              Clear All
            </button>
          </section>

          <section>
            <div style={{ background: "#111", color: "#fff", borderRadius: "28px", padding: "26px", marginBottom: "20px" }}>
              <div style={{ color: "#bbb", fontWeight: "800", fontSize: "13px", letterSpacing: "1.5px", textTransform: "uppercase" }}>
                Next 18 Hours
              </div>
              <h2 style={{ fontSize: "32px", margin: "8px 0 0" }}>
                Mission-Critical Signals
              </h2>
              {signals.length > 5 && <p>Too many signals — cut harder.</p>}
            </div>

            {signals.length === 0 && (
              <div style={{ background: "#fff", borderRadius: "24px", padding: "24px", color: "#666" }}>
                No signal tasks yet. Add tasks and score them.
              </div>
            )}

            <div style={{ display: "grid", gap: "14px", marginBottom: "24px" }}>
              {signals.map((t, i) => (
                <TaskCard key={t.id} task={t} index={i + 1} setTasks={setTasks} tasks={tasks} />
              ))}
            </div>

            <div style={{ background: "#fff", borderRadius: "28px", padding: "24px", boxShadow: "0 20px 60px rgba(0,0,0,0.06)" }}>
              <h2 style={{ marginTop: 0 }}>Noise Handling</h2>
              {noise.length === 0 ? (
                <p style={{ color: "#666" }}>No noise tasks yet.</p>
              ) : (
                <div style={{ display: "grid", gap: "12px" }}>
                  {noise.map((t) => (
                    <TaskCard key={t.id} task={t} setTasks={setTasks} tasks={tasks} compact />
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function TaskCard({ task, index, tasks, setTasks, compact }) {
  return (
    <div style={{ background: "#fff", borderRadius: "24px", padding: compact ? "18px" : "24px", boxShadow: "0 12px 34px rgba(0,0,0,0.07)", borderLeft: `8px solid ${task.color}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "18px" }}>
        <div>
          {index && <div style={{ color: "#777", fontWeight: "900", fontSize: "13px" }}>SIGNAL #{index}</div>}
          <h3 style={{ margin: "5px 0", fontSize: compact ? "18px" : "24px" }}>{task.title}</h3>
          <div style={{ color: "#666" }}>{task.area || "No area set"}</div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ background: task.color, color: "#fff", padding: "10px 14px", borderRadius: "16px", fontWeight: "900", fontSize: "20px" }}>
            {task.score}
          </div>
        </div>
      </div>

      <div style={{ marginTop: "14px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <span style={{ background: "#f0f0f0", padding: "8px 12px", borderRadius: "999px", fontWeight: "800" }}>{task.label}</span>
        <span style={{ background: "#fff7ed", padding: "8px 12px", borderRadius: "999px", fontWeight: "800" }}>{task.action}</span>
        <button
          onClick={() => setTasks(tasks.filter((x) => x.id !== task.id))}
          style={{ marginLeft: "auto", border: "none", background: "#fee2e2", color: "#991b1b", borderRadius: "999px", padding: "8px 12px", fontWeight: "900", cursor: "pointer" }}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
