import { useEffect, useMemo, useState } from "react";

function analyzeTask(task, type) {
  const text = task.toLowerCase();

  let score = 0;
  const reasons = [];

  const signalWords = [
    "tax", "invoice", "client", "audit", "health", "meeting", "deadline",
    "strategy", "repair", "urgent", "critical", "payroll", "legal",
    "contract", "doctor", "family", "important", "fix", "money",
    "business", "plan", "decision", "order", "book", "submit", "call",
    "customer", "quote", "safety", "risk", "due", "finish", "send"
  ];

  const noiseWords = [
    "youtube", "instagram", "facebook", "scroll", "browse", "later",
    "someday", "maybe", "tidy", "organize", "watch", "check social",
    "random", "move", "sort", "clean", "look at"
  ];

  const deepWorkWords = [
    "design", "build", "strategy", "write", "create", "develop",
    "problem", "analysis", "system", "plan", "review", "prepare"
  ];

  signalWords.forEach((word) => {
    if (text.includes(word)) {
      score += 3;
      reasons.push(`Important signal: ${word}`);
    }
  });

  noiseWords.forEach((word) => {
    if (text.includes(word)) {
      score -= 2;
      reasons.push(`Possible noise: ${word}`);
    }
  });

  deepWorkWords.forEach((word) => {
    if (text.includes(word)) {
      score += 2;
      reasons.push("Deep focus work");
    }
  });

  if (type === "Work") score += 1;
  if (text.length > 40) score += 1;

  let category = "Noise";
  let recommendation = "Defer, batch later, delegate, or ignore.";

  if (score >= 7) {
    category = "Critical Signal";
    recommendation = "Protect time for this today.";
  } else if (score >= 4) {
    category = "Signal";
    recommendation = "Schedule and complete intentionally.";
  }

  return { score, category, recommendation, reasons };
}

export default function App() {
  const [input, setInput] = useState("");
  const [type, setType] = useState("Work");
  const [showPlan, setShowPlan] = useState(false);

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("signal-tasks");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("signal-tasks", JSON.stringify(tasks));
  }, [tasks]);

  function addTask() {
    if (!input.trim()) return;

    const analysis = analyzeTask(input, type);

    setTasks([
      {
        id: Date.now(),
        text: input,
        type,
        ...analysis,
      },
      ...tasks,
    ]);

    setInput("");
  }

  function clearAll() {
    if (confirm("Clear all tasks?")) {
      setTasks([]);
      setShowPlan(false);
    }
  }

  const signals = useMemo(() => {
    return tasks
      .filter((t) => t.category === "Critical Signal" || t.category === "Signal")
      .sort((a, b) => b.score - a.score);
  }, [tasks]);

  const noise = useMemo(() => {
    return tasks.filter((t) => t.category === "Noise");
  }, [tasks]);

  return (
    <div className="app">
      <style>{css}</style>

      <div className="shell">
        <section className="hero glass">
          <div className="eyebrow">Signal over noise</div>
          <h1>
            Find the signal.
            <br />
            Ignore the noise.
          </h1>
          <p>
            A calm decision system that turns mental overload into a simple focus
            plan for your next 18 hours.
          </p>
        </section>

        <section className="capture glass">
          <div className="captureTop">
            <div>
              <h2>What's on your mind?</h2>
              <p>Brain dump the task. The system will decide where it belongs.</p>
            </div>

            <div className="toggle">
              {["Work", "Personal"].map((item) => (
                <button
                  key={item}
                  onClick={() => setType(item)}
                  className={type === item ? "active" : ""}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Need to call accountant about BAS..."
            rows={4}
          />

          <div className="actions">
            <button className="primary" onClick={addTask}>
              Find The Signal
            </button>

            <button
              className="secondary"
              onClick={() => setShowPlan((v) => !v)}
              disabled={tasks.length === 0}
            >
              {showPlan ? "Hide Focus Plan" : "Generate Focus Plan"}
            </button>

            <button className="ghost" onClick={clearAll} disabled={tasks.length === 0}>
              Clear
            </button>
          </div>
        </section>

        <section className="stats">
          <Stat label="Captured" value={tasks.length} />
          <Stat label="Signals" value={signals.length} />
          <Stat label="Noise" value={noise.length} />
          <Stat label="Focus limit" value="3–5" />
        </section>

        {showPlan && (
          <section className="focusPlan glass">
            <div className="planHeader">
              <div>
                <div className="eyebrow">Generated focus plan</div>
                <h2>Your next 18 hours</h2>
              </div>
              <button className="printBtn" onClick={() => window.print()}>
                Print
              </button>
            </div>

            <div className="planGrid">
              <div className="planColumn left">
                <h3>Critical Signals</h3>
                <p className="columnHint">Do these first. Protect time for them.</p>

                {signals.length === 0 ? (
                  <Empty text="No signal tasks detected." />
                ) : (
                  signals.slice(0, 5).map((task, index) => (
                    <PlanItem key={task.id} task={task} index={index + 1} />
                  ))
                )}
              </div>

              <div className="planColumn right">
                <h3>Noise Quarantine</h3>
                <p className="columnHint">
                  Defer, batch, delegate, delete, or park these.
                </p>

                {noise.length === 0 ? (
                  <Empty text="No noise tasks detected." />
                ) : (
                  noise.map((task) => <PlanItem key={task.id} task={task} muted />)
                )}
              </div>
            </div>
          </section>
        )}

        <section className="mainGrid">
          <div>
            <div className="sectionHeader dark">
              <div className="eyebrow">Next 18 hours</div>
              <h2>Mission-Critical Signals</h2>
            </div>

            {signals.length === 0 ? (
              <Empty text="No important signals detected yet." />
            ) : (
              signals.map((task) => <TaskCard key={task.id} task={task} />)
            )}
          </div>

          <div>
            <div className="sectionHeader light">
              <div className="eyebrow">Noise quarantine</div>
              <h2>Mentally parked.</h2>
              <p>
                Low-value, reactive or non-critical items are stored here so they
                stop stealing attention.
              </p>
            </div>

            {noise.length === 0 ? (
              <Empty text="No noise detected." />
            ) : (
              noise.map((task) => <TaskCard key={task.id} task={task} muted />)
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat glass">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Empty({ text }) {
  return <div className="empty">{text}</div>;
}

function PlanItem({ task, index, muted }) {
  return (
    <div className={muted ? "planItem muted" : "planItem"}>
      <div className="planNum">{index || "•"}</div>
      <div>
        <strong>{task.text}</strong>
        <span>{task.recommendation}</span>
      </div>
    </div>
  );
}

function TaskCard({ task, muted }) {
  return (
    <div className={muted ? "taskCard muted" : "taskCard"}>
      <div className="taskTop">
        <div>
          <div className="taskType">{task.category}</div>
          <h3>{task.text}</h3>
          <span>{task.type}</span>
        </div>

        <div className="score">{task.score}</div>
      </div>

      <p>
        <strong>Recommendation:</strong> {task.recommendation}
      </p>

      {task.reasons.length > 0 && (
        <div className="chips">
          {task.reasons.slice(0, 3).map((reason, i) => (
            <span key={i}>{reason}</span>
          ))}
        </div>
      )}
    </div>
  );
}

const css = `
* {
  box-sizing: border-box;
}

body {
  margin: 0;
}

.app {
  min-height: 100vh;
  background:
    radial-gradient(circle at 20% 0%, rgba(255,255,255,0.95), transparent 35%),
    linear-gradient(135deg, #f4f2ee 0%, #e9e7e1 100%);
  color: #111;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
}

.shell {
  width: min(1120px, calc(100% - 28px));
  margin: 0 auto;
  padding: 28px 0 60px;
}

.glass {
  background: rgba(255,255,255,0.82);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(255,255,255,0.7);
  box-shadow: 0 24px 70px rgba(0,0,0,0.08);
}

.hero {
  border-radius: 34px;
  padding: clamp(28px, 5vw, 56px);
  margin-bottom: 18px;
}

.eyebrow {
  color: #777;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 2.6px;
  text-transform: uppercase;
}

.hero h1 {
  font-size: clamp(42px, 8vw, 78px);
  line-height: 0.95;
  margin: 12px 0 18px;
  letter-spacing: -4px;
}

.hero p {
  max-width: 680px;
  margin: 0;
  color: #555;
  font-size: 18px;
  line-height: 1.6;
}

.capture {
  border-radius: 30px;
  padding: 24px;
  margin-bottom: 18px;
}

.captureTop {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-start;
  margin-bottom: 14px;
}

.capture h2 {
  margin: 0;
  font-size: 22px;
}

.capture p {
  margin: 6px 0 0;
  color: #666;
}

textarea {
  width: 100%;
  border: 1px solid #d8d8d8;
  border-radius: 24px;
  padding: 20px;
  resize: none;
  outline: none;
  font-size: 18px;
  line-height: 1.45;
  background: rgba(255,255,255,0.72);
  transition: 0.2s;
}

textarea:focus {
  border-color: #111;
  box-shadow: 0 0 0 4px rgba(0,0,0,0.06);
}

.toggle {
  display: flex;
  gap: 8px;
  background: #eee;
  padding: 6px;
  border-radius: 999px;
}

.toggle button,
.primary,
.secondary,
.ghost,
.printBtn {
  border: none;
  cursor: pointer;
  font-weight: 900;
}

.toggle button {
  padding: 10px 15px;
  border-radius: 999px;
  color: #444;
  background: transparent;
}

.toggle button.active {
  background: #111;
  color: white;
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
  margin-top: 16px;
}

.primary,
.secondary,
.ghost,
.printBtn {
  padding: 14px 20px;
  border-radius: 18px;
  font-size: 14px;
}

.primary {
  background: #111;
  color: #fff;
}

.secondary {
  background: #f2efe8;
  color: #111;
  border: 1px solid #ded8cc;
}

.ghost {
  background: transparent;
  color: #777;
  border: 1px solid #ddd;
}

button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 18px;
}

.stat {
  border-radius: 24px;
  padding: 22px;
}

.stat span {
  display: block;
  color: #777;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stat strong {
  display: block;
  margin-top: 8px;
  font-size: 38px;
  letter-spacing: -1px;
}

.focusPlan {
  border-radius: 34px;
  padding: 28px;
  margin-bottom: 22px;
}

.planHeader {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 22px;
}

.planHeader h2 {
  font-size: 36px;
  margin: 6px 0 0;
  letter-spacing: -1.5px;
}

.printBtn {
  background: #111;
  color: #fff;
}

.planGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.planColumn {
  border-radius: 28px;
  padding: 22px;
  min-height: 260px;
}

.planColumn.left {
  background: #111;
  color: #fff;
}

.planColumn.right {
  background: #efefed;
}

.planColumn h3 {
  margin: 0;
  font-size: 26px;
  letter-spacing: -0.8px;
}

.columnHint {
  color: inherit;
  opacity: 0.65;
  margin: 8px 0 18px;
}

.planItem {
  display: flex;
  gap: 12px;
  padding: 14px;
  border-radius: 18px;
  margin-bottom: 10px;
  background: rgba(255,255,255,0.12);
}

.planItem.muted {
  background: rgba(0,0,0,0.05);
}

.planNum {
  min-width: 34px;
  height: 34px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(255,255,255,0.18);
  font-weight: 900;
}

.planItem.muted .planNum {
  background: rgba(0,0,0,0.08);
}

.planItem strong {
  display: block;
  font-size: 16px;
}

.planItem span {
  display: block;
  margin-top: 4px;
  opacity: 0.7;
  font-size: 13px;
}

.mainGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
}

.sectionHeader {
  border-radius: 28px;
  padding: 26px;
  margin-bottom: 14px;
}

.sectionHeader.dark {
  background: #111;
  color: #fff;
}

.sectionHeader.light {
  background: rgba(255,255,255,0.82);
  box-shadow: 0 20px 50px rgba(0,0,0,0.05);
}

.sectionHeader h2 {
  margin: 8px 0 0;
  font-size: 34px;
  letter-spacing: -1px;
}

.sectionHeader p {
  color: #666;
  line-height: 1.6;
}

.empty {
  background: rgba(255,255,255,0.82);
  border-radius: 22px;
  padding: 22px;
  color: #777;
  margin-bottom: 14px;
}

.taskCard {
  background: #111;
  color: #fff;
  border-radius: 26px;
  padding: 24px;
  margin-bottom: 14px;
  box-shadow: 0 18px 45px rgba(0,0,0,0.14);
}

.taskCard.muted {
  background: #dedddb;
  color: #111;
  box-shadow: none;
}

.taskTop {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.taskType {
  color: inherit;
  opacity: 0.62;
  font-size: 11px;
  letter-spacing: 1.8px;
  text-transform: uppercase;
  font-weight: 900;
}

.taskCard h3 {
  font-size: 23px;
  line-height: 1.2;
  margin: 8px 0;
  letter-spacing: -0.6px;
}

.taskCard span {
  opacity: 0.7;
}

.score {
  min-width: 46px;
  height: 46px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  font-size: 22px;
  font-weight: 900;
  background: rgba(255,255,255,0.14);
}

.taskCard.muted .score {
  background: rgba(0,0,0,0.08);
}

.taskCard p {
  margin: 16px 0 0;
  line-height: 1.5;
  font-size: 14px;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.chips span {
  padding: 8px 11px;
  border-radius: 999px;
  background: rgba(255,255,255,0.12);
  font-size: 12px;
  font-weight: 700;
}

.taskCard.muted .chips span {
  background: rgba(0,0,0,0.07);
}

@media (max-width: 840px) {
  .stats,
  .mainGrid,
  .planGrid {
    grid-template-columns: 1fr;
  }

  .captureTop {
    flex-direction: column;
  }

  .hero h1 {
    letter-spacing: -2px;
  }

  .actions {
    justify-content: stretch;
  }

  .actions button {
    flex: 1;
  }
}

@media print {
  .hero,
  .capture,
  .stats,
  .mainGrid {
    display: none;
  }

  .app {
    background: white;
  }

  .focusPlan {
    box-shadow: none;
    border: none;
  }

  .printBtn {
    display: none;
  }
}
`;
