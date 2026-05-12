import { useEffect, useMemo, useState } from "react";

function analyzeTask(task, type) {
  const text = task.toLowerCase();
  let score = 0;
  const reasons = [];

  const signalWords = [
    "tax", "invoice", "client", "audit", "health", "meeting", "deadline",
    "strategy", "repair", "urgent", "critical", "payroll", "legal", "contract",
    "doctor", "family", "important", "fix", "money", "business", "plan",
    "decision", "order", "book", "submit", "call", "customer", "quote",
    "safety", "risk", "due", "finish", "send", "pay", "school", "appointment",
    "workout", "diet", "sleep", "relationship", "parent", "child"
  ];

  const noiseWords = [
    "youtube", "instagram", "facebook", "scroll", "browse", "later", "someday",
    "maybe", "tidy", "organize", "watch", "check social", "random", "move",
    "sort", "clean", "look at", "play around", "mess around"
  ];

  const deepWorkWords = [
    "design", "build", "strategy", "write", "create", "develop", "problem",
    "analysis", "system", "plan", "review", "prepare", "think", "learn"
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
  let recommendation = "This can safely wait. Park it, batch it, delegate it, or delete it.";

  if (score >= 7) {
    category = "Critical Signal";
    recommendation = "This deserves protected attention today.";
  } else if (score >= 4) {
    category = "Signal";
    recommendation = "Schedule this intentionally before the day gets noisy.";
  }

  return { score, category, recommendation, reasons };
}

export default function App() {
  const [input, setInput] = useState("");
  const [type, setType] = useState("Work");
  const [showPlan, setShowPlan] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [theme, setTheme] = useState("light");

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("signal-noise-tasks");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("signal-noise-tasks", JSON.stringify(tasks));
  }, [tasks]);

  function addTask() {
    if (!input.trim()) return;

    const analysis = analyzeTask(input, type);

    setTasks([
      {
        id: Date.now(),
        text: input.trim(),
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
      setFocusMode(false);
    }
  }

  function removeTask(id) {
    setTasks(tasks.filter((task) => task.id !== id));
  }

  const signals = useMemo(() => {
    return tasks
      .filter((t) => t.category === "Critical Signal" || t.category === "Signal")
      .sort((a, b) => b.score - a.score);
  }, [tasks]);

  const noise = useMemo(() => {
    return tasks.filter((t) => t.category === "Noise");
  }, [tasks]);

  const topSignals = signals.slice(0, 3);

  if (focusMode) {
    return (
      <div className="app darkApp">
        <style>{css}</style>
        <section className="focusScreen">
          <div className="focusLogo">
            <Logo />
            <span>Signal : Noise</span>
          </div>

          <div className="focusEyebrow">Focus Mode</div>
          <h1>Only the signal remains.</h1>
          <p className="focusIntro">
            These are the few things that deserve your next focused block of attention.
          </p>

          <div className="focusCards">
            {topSignals.length === 0 ? (
              <div className="focusEmpty">No signals selected yet.</div>
            ) : (
              topSignals.map((task, index) => (
                <div className="focusTask" key={task.id}>
                  <div className="focusNumber">{index + 1}</div>
                  <div>
                    <h2>{task.text}</h2>
                    <p>{task.recommendation}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <button className="exitFocus" onClick={() => setFocusMode(false)}>
            Exit Focus Mode
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className={`app ${theme === "dark" ? "darkApp" : ""}`}>
      <style>{css}</style>

      <div className="shell">
        <nav className="topNav">
          <div className="brand">
            <Logo />
            <div>
              <strong>Signal : Noise</strong>
              <span>Daily Planner</span>
            </div>
          </div>

          <div className="navActions">
            <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
              {theme === "light" ? "Dark" : "Light"}
            </button>
            <button onClick={() => setFocusMode(true)} disabled={signals.length === 0}>
              Focus Mode
            </button>
          </div>
        </nav>

        <section className="hero glass">
          <div className="eyebrow">Find what matters. Park what doesn’t.</div>
          <h1>
            Clear your head.
            <br />
            Find the signal.
          </h1>
          <p>
            Brain dump the noise. The planner separates what deserves attention from what can wait, so your next move becomes obvious.
          </p>
        </section>

        <section className="capture glass">
          <div className="captureTop">
            <div>
              <h2>What's on your mind?</h2>
              <p>Enter one thought, task, worry, or reminder. The system will classify it.</p>
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
            placeholder="Example: Call accountant about BAS before Friday..."
            rows={4}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") addTask();
            }}
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
          <Stat label="Top focus" value={topSignals.length} />
        </section>

        {showPlan && (
          <section className="focusPlan glass">
            <div className="planHeader">
              <div>
                <div className="eyebrow">Generated focus plan</div>
                <h2>Your next 18 hours</h2>
              </div>

              <div className="planButtons">
                <button className="printBtn" onClick={() => window.print()}>
                  Print
                </button>
                <button
                  className="printBtn mutedBtn"
                  onClick={() => setFocusMode(true)}
                  disabled={signals.length === 0}
                >
                  Enter Focus
                </button>
              </div>
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
                <p className="columnHint">Defer, batch, delegate, delete, or park these.</p>

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
              signals.map((task) => (
                <TaskCard key={task.id} task={task} removeTask={removeTask} />
              ))
            )}
          </div>

          <div>
            <div className="sectionHeader light">
              <div className="eyebrow">Noise quarantine</div>
              <h2>Mentally parked.</h2>
              <p>
                Low-value, reactive or non-critical items are stored here so they stop stealing attention.
              </p>
            </div>

            {noise.length === 0 ? (
              <Empty text="No noise detected." />
            ) : (
              noise.map((task) => (
                <TaskCard key={task.id} task={task} muted removeTask={removeTask} />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <div className="logoMark">
      <div className="logoDot"></div>
      <div className="logoLine"></div>
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

function TaskCard({ task, muted, removeTask }) {
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

      <button className="removeBtn" onClick={() => removeTask(task.id)}>
        Remove
      </button>
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
    radial-gradient(circle at 18% 0%, rgba(255,255,255,0.95), transparent 38%),
    radial-gradient(circle at 85% 12%, rgba(228,221,207,0.85), transparent 35%),
    linear-gradient(135deg, #f7f5ef 0%, #e8e4da 100%);
  color: #111;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
}

.darkApp {
  background:
    radial-gradient(circle at 18% 0%, rgba(80,80,90,0.35), transparent 35%),
    radial-gradient(circle at 82% 12%, rgba(150,120,80,0.22), transparent 32%),
    linear-gradient(135deg, #090909 0%, #151515 100%);
  color: #f6f2ea;
}

.shell {
  width: min(1120px, calc(100% - 28px));
  margin: 0 auto;
  padding: 24px 0 70px;
}

.glass {
  background: rgba(255,255,255,0.78);
  backdrop-filter: blur(22px);
  border: 1px solid rgba(255,255,255,0.7);
  box-shadow: 0 28px 80px rgba(0,0,0,0.09);
}

.darkApp .glass,
.darkApp .sectionHeader.light,
.darkApp .empty {
  background: rgba(28,28,30,0.82);
  border-color: rgba(255,255,255,0.08);
  color: #f7f2e8;
}

.topNav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  padding: 8px 4px;
}

.brand {
  display: flex;
  gap: 12px;
  align-items: center;
}

.brand strong {
  display: block;
  font-size: 18px;
  letter-spacing: -0.3px;
}

.brand span {
  display: block;
  color: #777;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.4px;
}

.darkApp .brand span,
.darkApp .eyebrow,
.darkApp .capture p,
.darkApp .hero p,
.darkApp .sectionHeader p,
.darkApp .columnHint {
  color: #aaa;
}

.logoMark {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  background: #111;
  display: grid;
  place-items: center;
  position: relative;
  box-shadow: 0 14px 30px rgba(0,0,0,0.18);
}

.darkApp .logoMark {
  background: #f7f2e8;
}

.logoDot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: white;
  position: absolute;
  left: 12px;
}

.darkApp .logoDot {
  background: #111;
}

.logoLine {
  width: 18px;
  height: 3px;
  border-radius: 99px;
  background: white;
  position: absolute;
  right: 10px;
}

.darkApp .logoLine {
  background: #111;
}

.navActions {
  display: flex;
  gap: 8px;
}

.navActions button {
  border: 1px solid rgba(0,0,0,0.08);
  background: rgba(255,255,255,0.72);
  padding: 10px 14px;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 900;
}

.darkApp .navActions button {
  background: rgba(255,255,255,0.08);
  color: #f7f2e8;
  border-color: rgba(255,255,255,0.12);
}

.hero {
  border-radius: 38px;
  padding: clamp(34px, 6vw, 68px);
  margin-bottom: 20px;
}

.eyebrow {
  color: #777;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 2.8px;
  text-transform: uppercase;
}

.hero h1 {
  font-size: clamp(48px, 8.5vw, 88px);
  line-height: 0.92;
  margin: 14px 0 22px;
  letter-spacing: -5px;
}

.hero p {
  max-width: 720px;
  margin: 0;
  color: #555;
  font-size: 19px;
  line-height: 1.65;
}

.capture {
  border-radius: 34px;
  padding: 28px;
  margin-bottom: 20px;
}

.captureTop {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-start;
  margin-bottom: 18px;
}

.capture h2 {
  margin: 0;
  font-size: 24px;
  letter-spacing: -0.6px;
}

.capture p {
  margin: 7px 0 0;
  color: #666;
}

textarea {
  width: 100%;
  border: 1px solid #d8d3c9;
  border-radius: 28px;
  padding: 22px;
  resize: none;
  outline: none;
  font-size: 18px;
  line-height: 1.45;
  background: rgba(255,255,255,0.72);
  transition: 0.2s ease;
  color: #111;
}

.darkApp textarea {
  background: rgba(255,255,255,0.06);
  border-color: rgba(255,255,255,0.12);
  color: #f7f2e8;
}

textarea:focus {
  border-color: #111;
  box-shadow: 0 0 0 4px rgba(0,0,0,0.06);
}

.darkApp textarea:focus {
  border-color: #f7f2e8;
  box-shadow: 0 0 0 4px rgba(255,255,255,0.08);
}

.toggle {
  display: flex;
  gap: 8px;
  background: rgba(0,0,0,0.06);
  padding: 6px;
  border-radius: 999px;
}

.toggle button,
.primary,
.secondary,
.ghost,
.printBtn,
.removeBtn,
.exitFocus {
  border: none;
  cursor: pointer;
  font-weight: 900;
  transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
}

button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.toggle button {
  padding: 10px 15px;
  border-radius: 999px;
  color: #444;
  background: transparent;
}

.darkApp .toggle button {
  color: #ddd;
}

.toggle button.active {
  background: #111;
  color: white;
}

.darkApp .toggle button.active {
  background: #f7f2e8;
  color: #111;
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
  margin-top: 18px;
}

.primary,
.secondary,
.ghost,
.printBtn {
  padding: 15px 22px;
  border-radius: 20px;
  font-size: 14px;
}

.primary {
  background: #111;
  color: #fff;
  box-shadow: 0 14px 28px rgba(0,0,0,0.18);
}

.darkApp .primary {
  background: #f7f2e8;
  color: #111;
}

.secondary {
  background: #f3eee3;
  color: #111;
  border: 1px solid #ded8cc;
}

.darkApp .secondary {
  background: rgba(255,255,255,0.08);
  color: #f7f2e8;
  border-color: rgba(255,255,255,0.12);
}

.ghost {
  background: transparent;
  color: #777;
  border: 1px solid #ddd;
}

.darkApp .ghost {
  color: #aaa;
  border-color: rgba(255,255,255,0.12);
}

button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 20px;
}

.stat {
  border-radius: 28px;
  padding: 24px;
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
  font-size: 40px;
  letter-spacing: -1px;
}

.focusPlan {
  border-radius: 38px;
  padding: 32px;
  margin-bottom: 24px;
}

.planHeader {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;
}

.planHeader h2 {
  font-size: 40px;
  margin: 7px 0 0;
  letter-spacing: -1.8px;
}

.planButtons {
  display: flex;
  gap: 10px;
}

.printBtn {
  background: #111;
  color: #fff;
}

.mutedBtn {
  background: #383838;
}

.darkApp .printBtn {
  background: #f7f2e8;
  color: #111;
}

.planGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.planColumn {
  border-radius: 32px;
  padding: 26px;
  min-height: 280px;
}

.planColumn.left {
  background: #111;
  color: #fff;
}

.darkApp .planColumn.left {
  background: #f7f2e8;
  color: #111;
}

.planColumn.right {
  background: #efede8;
}

.darkApp .planColumn.right {
  background: rgba(255,255,255,0.08);
}

.planColumn h3 {
  margin: 0;
  font-size: 28px;
  letter-spacing: -1px;
}

.columnHint {
  opacity: 0.65;
  margin: 8px 0 20px;
}

.planItem {
  display: flex;
  gap: 13px;
  padding: 16px;
  border-radius: 21px;
  margin-bottom: 11px;
  background: rgba(255,255,255,0.12);
}

.planItem.muted {
  background: rgba(0,0,0,0.05);
}

.darkApp .planItem.muted {
  background: rgba(255,255,255,0.07);
}

.planNum {
  min-width: 36px;
  height: 36px;
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
  gap: 24px;
}

.sectionHeader {
  border-radius: 32px;
  padding: 28px;
  margin-bottom: 16px;
}

.sectionHeader.dark {
  background: #111;
  color: #fff;
}

.darkApp .sectionHeader.dark {
  background: #f7f2e8;
  color: #111;
}

.sectionHeader.light {
  background: rgba(255,255,255,0.78);
  box-shadow: 0 20px 50px rgba(0,0,0,0.05);
}

.sectionHeader h2 {
  margin: 8px 0 0;
  font-size: 36px;
  letter-spacing: -1.2px;
}

.sectionHeader p {
  color: #666;
  line-height: 1.6;
}

.empty {
  background: rgba(255,255,255,0.78);
  border-radius: 24px;
  padding: 24px;
  color: #777;
  margin-bottom: 16px;
}

.taskCard {
  background: #111;
  color: #fff;
  border-radius: 30px;
  padding: 26px;
  margin-bottom: 16px;
  box-shadow: 0 22px 55px rgba(0,0,0,0.16);
  position: relative;
  overflow: hidden;
}

.darkApp .taskCard {
  background: #f7f2e8;
  color: #111;
}

.taskCard.muted {
  background: #dfddd8;
  color: #111;
  box-shadow: none;
}

.darkApp .taskCard.muted {
  background: rgba(255,255,255,0.08);
  color: #f7f2e8;
}

.taskTop {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.taskType {
  opacity: 0.62;
  font-size: 11px;
  letter-spacing: 1.9px;
  text-transform: uppercase;
  font-weight: 900;
}

.taskCard h3 {
  font-size: 24px;
  line-height: 1.2;
  margin: 9px 0;
  letter-spacing: -0.7px;
}

.taskCard span {
  opacity: 0.7;
}

.score {
  min-width: 48px;
  height: 48px;
  border-radius: 17px;
  display: grid;
  place-items: center;
  font-size: 22px;
  font-weight: 900;
  background: rgba(255,255,255,0.14);
}

.darkApp .taskCard .score {
  background: rgba(0,0,0,0.08);
}

.taskCard.muted .score {
  background: rgba(0,0,0,0.08);
}

.darkApp .taskCard.muted .score {
  background: rgba(255,255,255,0.08);
}

.taskCard p {
  margin: 17px 0 0;
  line-height: 1.55;
  font-size: 14px;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 15px;
}

.chips span {
  padding: 8px 11px;
  border-radius: 999px;
  background: rgba(255,255,255,0.12);
  font-size: 12px;
  font-weight: 700;
}

.darkApp .taskCard .chips span {
  background: rgba(0,0,0,0.08);
}

.taskCard.muted .chips span {
  background: rgba(0,0,0,0.07);
}

.darkApp .taskCard.muted .chips span {
  background: rgba(255,255,255,0.08);
}

.removeBtn {
  margin-top: 16px;
  padding: 10px 13px;
  border-radius: 999px;
  background: rgba(255,255,255,0.12);
  color: inherit;
}

.taskCard.muted .removeBtn {
  background: rgba(0,0,0,0.06);
}

.focusScreen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: min(920px, calc(100% - 28px));
  margin: 0 auto;
  padding: 40px 0;
}

.focusLogo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 900;
  margin-bottom: 52px;
}

.focusEyebrow {
  color: #aaa;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 3px;
  font-weight: 900;
}

.focusScreen h1 {
  font-size: clamp(48px, 8vw, 88px);
  line-height: 0.95;
  margin: 12px 0 18px;
  letter-spacing: -4px;
}

.focusIntro {
  color: #bdb7ad;
  font-size: 19px;
  max-width: 680px;
  line-height: 1.6;
  margin-bottom: 30px;
}

.focusCards {
  display: grid;
  gap: 16px;
}

.focusTask {
  display: flex;
  gap: 18px;
  align-items: flex-start;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 30px;
  padding: 24px;
}

.focusNumber {
  min-width: 44px;
  height: 44px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #f7f2e8;
  color: #111;
  font-weight: 900;
}

.focusTask h2 {
  margin: 0 0 8px;
  font-size: 26px;
  letter-spacing: -0.7px;
}

.focusTask p {
  color: #bdb7ad;
  margin: 0;
}

.focusEmpty {
  color: #aaa;
  background: rgba(255,255,255,0.08);
  border-radius: 24px;
  padding: 24px;
}

.exitFocus {
  margin-top: 30px;
  align-self: flex-start;
  background: #f7f2e8;
  color: #111;
  border-radius: 999px;
  padding: 14px 20px;
}

@media (max-width: 860px) {
  .topNav {
    align-items: flex-start;
    gap: 14px;
  }

  .stats,
  .mainGrid,
  .planGrid {
    grid-template-columns: 1fr;
  }

  .captureTop,
  .planHeader {
    flex-direction: column;
    align-items: stretch;
  }

  .hero h1 {
    letter-spacing: -2.5px;
  }

  .actions,
  .planButtons {
    justify-content: stretch;
  }

  .actions button,
  .planButtons button {
    flex: 1;
  }

  .stat strong {
    font-size: 34px;
  }
}

@media (max-width: 520px) {
  .shell {
    width: min(100% - 18px, 1120px);
    padding-top: 12px;
  }

  .topNav {
    flex-direction: column;
  }

  .navActions {
    width: 100%;
  }

  .navActions button {
    flex: 1;
  }

  .hero,
  .capture,
  .focusPlan {
    border-radius: 26px;
  }

  .hero {
    padding: 28px;
  }

  .hero h1 {
    font-size: 47px;
  }

  .capture {
    padding: 20px;
  }

  textarea {
    font-size: 16px;
  }

  .toggle {
    width: 100%;
  }

  .toggle button {
    flex: 1;
  }

  .taskTop {
    flex-direction: column;
  }
}

@media print {
  .topNav,
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
