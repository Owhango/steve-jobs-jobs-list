import { useEffect, useMemo, useState } from "react";

function analyzeTask(task) {
  const text = task.toLowerCase();

  let score = 0;
  const reasons = [];

  const signalWords = [
    "tax","invoice","client","audit","health","meeting","deadline",
    "urgent","important","doctor","family","pay","money","repair",
    "fix","contract","legal","school","appointment","business",
    "quote","risk","safety","finish","submit","call","review"
  ];

  const noiseWords = [
    "youtube","instagram","scroll","browse","later","maybe",
    "tidy","organize","watch","random","clean","move","sort"
  ];

  signalWords.forEach(word => {
    if (text.includes(word)) {
      score += 3;
      reasons.push(`Important signal detected`);
    }
  });

  noiseWords.forEach(word => {
    if (text.includes(word)) {
      score -= 2;
      reasons.push(`Possible low-value distraction`);
    }
  });

  if (text.length > 45) {
    score += 1;
  }

  let category = "Noise";
  let recommendation =
    "This can likely wait without meaningful consequences.";

  if (score >= 6) {
    category = "Signal";
    recommendation =
      "This appears important and deserves attention soon.";
  }

  return {
    category,
    recommendation,
    reasons,
  };
}

export default function App() {
  const [input, setInput] = useState("");
  const [type, setType] = useState("Work");
  const [showResults, setShowResults] = useState(false);

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("signal-noise-clean");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("signal-noise-clean", JSON.stringify(tasks));
  }, [tasks]);

  function addTask() {
    if (!input.trim()) return;

    const analysis = analyzeTask(input);

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
    setShowResults(true);
  }

  function clearAll() {
    if (confirm("Clear everything?")) {
      setTasks([]);
      setShowResults(false);
    }
  }

  const signals = useMemo(() => {
    return tasks.filter((t) => t.category === "Signal").slice(0, 3);
  }, [tasks]);

  const noise = useMemo(() => {
    return tasks.filter((t) => t.category === "Noise");
  }, [tasks]);

  return (
    <div className="app">
      <style>{css}</style>

      <div className="shell">

        <div className="logoWrap">
          <div className="logo">
            <div className="dot"></div>
            <div className="line"></div>
          </div>

          <div>
            <h2>Signal : Noise</h2>
            <span>Daily Planner</span>
          </div>
        </div>

        <section className="hero">
          <div className="eyebrow">
            FIND WHAT MATTERS
          </div>

          <h1>
            Clear your head.
          </h1>

          <p>
            Dump your thoughts, tasks, worries, or reminders.
            The system separates signal from noise automatically.
          </p>

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

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What's on your mind?"
            rows={5}
          />

          <button className="mainButton" onClick={addTask}>
            Clear My Head
          </button>

          {tasks.length > 0 && (
            <button className="clearButton" onClick={clearAll}>
              Reset
            </button>
          )}
        </section>

        {showResults && (
          <section className="results">

            <div className="signals">
              <div className="sectionTop">
                <div className="smallLabel">YOUR SIGNALS</div>
                <h3>These deserve attention.</h3>
              </div>

              {signals.length === 0 ? (
                <Empty text="No important signals detected yet." />
              ) : (
                signals.map((task, index) => (
                  <Card
                    key={task.id}
                    task={task}
                    index={index + 1}
                  />
                ))
              )}
            </div>

            <div className="noise">
              <div className="sectionTop">
                <div className="smallLabel">NOISE PARKED</div>
                <h3>These can safely wait.</h3>
              </div>

              {noise.length === 0 ? (
                <Empty text="No noise detected." />
              ) : (
                noise.map((task) => (
                  <Card
                    key={task.id}
                    task={task}
                    muted
                  />
                ))
              )}
            </div>

          </section>
        )}
      </div>
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="empty">
      {text}
    </div>
  );
}

function Card({ task, index, muted }) {
  return (
    <div className={muted ? "card muted" : "card"}>
      {index && (
        <div className="number">
          {index}
        </div>
      )}

      <h4>{task.text}</h4>

      <p>{task.recommendation}</p>
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
    radial-gradient(circle at top left, rgba(255,255,255,0.95), transparent 40%),
    linear-gradient(135deg, #f7f4ee 0%, #ece7dd 100%);
  color: #111;
  font-family: Inter, system-ui, sans-serif;
}

.shell {
  width: min(760px, calc(100% - 28px));
  margin: 0 auto;
  padding: 36px 0 80px;
}

.logoWrap {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 42px;
}

.logoWrap h2 {
  margin: 0;
  font-size: 20px;
  letter-spacing: -0.5px;
}

.logoWrap span {
  color: #777;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1.6px;
  font-weight: 800;
}

.logo {
  width: 48px;
  height: 48px;
  border-radius: 18px;
  background: #111;
  position: relative;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: white;
  position: absolute;
  left: 11px;
  top: 19px;
}

.line {
  width: 18px;
  height: 3px;
  border-radius: 999px;
  background: white;
  position: absolute;
  right: 10px;
  top: 22px;
}

.hero {
  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(20px);
  border-radius: 40px;
  padding: 42px;
  box-shadow: 0 30px 80px rgba(0,0,0,0.08);
}

.eyebrow {
  color: #777;
  font-size: 11px;
  letter-spacing: 3px;
  font-weight: 900;
}

.hero h1 {
  font-size: clamp(52px, 10vw, 82px);
  line-height: 0.95;
  margin: 16px 0;
  letter-spacing: -4px;
}

.hero p {
  color: #555;
  line-height: 1.7;
  font-size: 18px;
  margin-bottom: 28px;
}

.toggle {
  display: inline-flex;
  gap: 8px;
  background: #efebe3;
  padding: 6px;
  border-radius: 999px;
  margin-bottom: 24px;
}

.toggle button {
  border: none;
  background: transparent;
  padding: 10px 16px;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 800;
  color: #555;
}

.toggle button.active {
  background: #111;
  color: white;
}

textarea {
  width: 100%;
  border: none;
  outline: none;
  border-radius: 30px;
  padding: 24px;
  font-size: 20px;
  line-height: 1.5;
  resize: none;
  background: rgba(255,255,255,0.85);
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.06);
  margin-bottom: 22px;
}

.mainButton {
  width: 100%;
  border: none;
  background: #111;
  color: white;
  padding: 20px;
  border-radius: 24px;
  font-size: 17px;
  font-weight: 900;
  cursor: pointer;
  transition: 0.2s;
}

.mainButton:hover {
  transform: translateY(-1px);
}

.clearButton {
  margin-top: 14px;
  width: 100%;
  border: none;
  background: transparent;
  color: #777;
  padding: 14px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 700;
}

.results {
  margin-top: 42px;
  display: grid;
  gap: 28px;
}

.sectionTop {
  margin-bottom: 18px;
}

.smallLabel {
  font-size: 11px;
  letter-spacing: 2px;
  font-weight: 900;
  color: #777;
}

.sectionTop h3 {
  margin: 8px 0 0;
  font-size: 34px;
  letter-spacing: -1px;
}

.card {
  position: relative;
  background: #111;
  color: white;
  border-radius: 30px;
  padding: 28px;
  margin-bottom: 14px;
  box-shadow: 0 24px 50px rgba(0,0,0,0.14);
}

.card.muted {
  background: rgba(255,255,255,0.55);
  color: #111;
  box-shadow: none;
}

.number {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(255,255,255,0.14);
  display: grid;
  place-items: center;
  font-weight: 900;
  margin-bottom: 18px;
}

.card.muted .number {
  background: rgba(0,0,0,0.08);
}

.card h4 {
  margin: 0 0 12px;
  font-size: 28px;
  line-height: 1.2;
  letter-spacing: -0.8px;
}

.card p {
  margin: 0;
  opacity: 0.8;
  line-height: 1.6;
}

.empty {
  background: rgba(255,255,255,0.65);
  border-radius: 24px;
  padding: 24px;
  color: #777;
}

@media (max-width: 640px) {
  .shell {
    width: calc(100% - 18px);
    padding-top: 20px;
  }

  .hero {
    padding: 26px;
    border-radius: 30px;
  }

  .hero h1 {
    letter-spacing: -2px;
  }

  textarea {
    font-size: 18px;
    padding: 20px;
  }

  .sectionTop h3 {
    font-size: 28px;
  }

  .card h4 {
    font-size: 24px;
  }
}
`;
