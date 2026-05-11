import { useEffect, useMemo, useState } from "react";

function analyzeTask(task, type) {
  const text = task.toLowerCase();

  let score = 0;
  let reasons = [];
  let category = "Noise";

  const signalWords = [
    "tax","invoice","client","audit","health","meeting",
    "deadline","strategy","repair","urgent","critical",
    "payroll","legal","contract","doctor","family",
    "important","fix","money","business","plan"
  ];

  const noiseWords = [
    "youtube","instagram","facebook","scroll","browse",
    "later","someday","maybe","tidy","organize",
    "watch","check social","random"
  ];

  const deepWorkWords = [
    "design","build","strategy","write","create",
    "develop","problem","analysis","system","plan"
  ];

  signalWords.forEach(word => {
    if (text.includes(word)) {
      score += 3;
      reasons.push(`Detected important keyword: "${word}"`);
    }
  });

  noiseWords.forEach(word => {
    if (text.includes(word)) {
      score -= 2;
      reasons.push(`Possible distraction/noise detected: "${word}"`);
    }
  });

  deepWorkWords.forEach(word => {
    if (text.includes(word)) {
      score += 2;
      reasons.push(`Deep focus work detected`);
    }
  });

  if (type === "Work") {
    score += 1;
  }

  if (text.length > 40) {
    score += 1;
  }

  if (score >= 7) {
    category = "Critical Signal";
  } else if (score >= 4) {
    category = "Signal";
  } else {
    category = "Noise";
  }

  let recommendation = "";

  if (category === "Critical Signal") {
    recommendation = "Protect time for this today.";
  } else if (category === "Signal") {
    recommendation = "Schedule and complete intentionally.";
  } else {
    recommendation = "Defer, batch later, delegate, or ignore.";
  }

  return {
    score,
    category,
    recommendation,
    reasons,
  };
}

export default function App() {
  const [input, setInput] = useState("");
  const [type, setType] = useState("Work");

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

    const newTask = {
      id: Date.now(),
      text: input,
      type,
      ...analysis,
    };

    setTasks([newTask, ...tasks]);
    setInput("");
  }

  const signals = useMemo(() => {
    return tasks.filter(
      t => t.category === "Critical Signal" || t.category === "Signal"
    );
  }, [tasks]);

  const noise = useMemo(() => {
    return tasks.filter(t => t.category === "Noise");
  }, [tasks]);

  const container = {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "30px 18px",
    fontFamily: "Inter, Arial, sans-serif",
  };

  return (
    <div style={{ background: "#f5f5f3", minHeight: "100vh", color: "#111" }}>
      <div style={container}>

        <div
          style={{
            background: "white",
            borderRadius: "30px",
            padding: "40px",
            marginBottom: "24px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "#777",
              fontWeight: "700",
            }}
          >
            Signal Over Noise
          </div>

          <h1
            style={{
              fontSize: "52px",
              margin: "10px 0",
              letterSpacing: "-2px",
            }}
          >
            Find the signal.
            <br />
            Ignore the noise.
          </h1>

          <p
            style={{
              color: "#555",
              maxWidth: "700px",
              lineHeight: 1.6,
              fontSize: "18px",
            }}
          >
            A decision operating system designed to reduce overwhelm,
            organize your thoughts, and focus your energy on what
            actually matters.
          </p>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "30px",
            padding: "30px",
            marginBottom: "28px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              fontWeight: "700",
              marginBottom: "14px",
              fontSize: "18px",
            }}
          >
            What's on your mind?
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Need to call accountant about BAS..."
            rows={4}
            style={{
              width: "100%",
              borderRadius: "20px",
              border: "1px solid #ddd",
              padding: "18px",
              fontSize: "17px",
              resize: "none",
              boxSizing: "border-box",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "18px",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", gap: "10px" }}>
              {["Work", "Personal"].map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  style={{
                    padding: "12px 18px",
                    borderRadius: "999px",
                    border: "none",
                    cursor: "pointer",
                    background: type === t ? "#111" : "#ececec",
                    color: type === t ? "white" : "#333",
                    fontWeight: "700",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              onClick={addTask}
              style={{
                background: "#111",
                color: "white",
                border: "none",
                padding: "14px 24px",
                borderRadius: "18px",
                cursor: "pointer",
                fontWeight: "800",
                fontSize: "15px",
              }}
            >
              Find The Signal
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "22px",
          }}
        >

          <div>
            <div
              style={{
                background: "#050505",
                color: "white",
                borderRadius: "26px",
                padding: "26px",
                marginBottom: "18px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: "#aaa",
                  fontWeight: "700",
                }}
              >
                Next 18 Hours
              </div>

              <h2 style={{ margin: "10px 0 0", fontSize: "34px" }}>
                Mission-Critical Signals
              </h2>
            </div>

            {signals.length === 0 && (
              <EmptyCard text="No important signals detected yet." />
            )}

            {signals.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>

          <div>
            <div
              style={{
                background: "white",
                borderRadius: "26px",
                padding: "26px",
                marginBottom: "18px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: "#777",
                  fontWeight: "700",
                }}
              >
                Noise Quarantine
              </div>

              <h2 style={{ marginTop: "10px", fontSize: "32px" }}>
                Mentally parked.
              </h2>

              <p style={{ color: "#666", lineHeight: 1.6 }}>
                Low-value, reactive, or non-critical items are moved
                here intentionally to reduce mental overload.
              </p>
            </div>

            {noise.length === 0 && (
              <EmptyCard text="No noise detected." />
            )}

            {noise.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

function EmptyCard({ text }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "22px",
        padding: "22px",
        color: "#666",
        marginBottom: "14px",
      }}
    >
      {text}
    </div>
  );
}

function TaskCard({ task }) {
  const bg =
    task.category === "Critical Signal"
      ? "#050505"
      : task.category === "Signal"
      ? "#12355b"
      : "#dcdcdc";

  const color =
    task.category === "Noise" ? "#222" : "white";

  return (
    <div
      style={{
        background: bg,
        color,
        borderRadius: "24px",
        padding: "24px",
        marginBottom: "16px",
        boxShadow: "0 14px 34px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "14px",
          alignItems: "start",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              opacity: 0.7,
              fontWeight: "700",
            }}
          >
            {task.category}
          </div>

          <h3
            style={{
              margin: "10px 0",
              fontSize: "24px",
              lineHeight: 1.3,
            }}
          >
            {task.text}
          </h3>

          <div style={{ opacity: 0.75 }}>
            {task.type}
          </div>
        </div>

        <div
          style={{
            background:
              task.category === "Noise"
                ? "#bbb"
                : "rgba(255,255,255,0.15)",
            borderRadius: "18px",
            padding: "12px 14px",
            fontWeight: "900",
            fontSize: "22px",
          }}
        >
          {task.score}
        </div>
      </div>

      <div
        style={{
          marginTop: "18px",
          lineHeight: 1.7,
          opacity: 0.9,
        }}
      >
        <strong>Recommendation:</strong> {task.recommendation}
      </div>

      <div
        style={{
          marginTop: "16px",
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        {task.reasons.map((r, i) => (
          <div
            key={i}
            style={{
              padding: "8px 12px",
              borderRadius: "999px",
              background:
                task.category === "Noise"
                  ? "rgba(0,0,0,0.08)"
                  : "rgba(255,255,255,0.12)",
              fontSize: "13px",
            }}
          >
            {r}
          </div>
        ))}
      </div>
    </div>
  );
}
