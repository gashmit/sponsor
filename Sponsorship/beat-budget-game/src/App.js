import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";

const categories = [
  { name: "DJ", min: 20, max: 80 },
  { name: "Lights", min: 10, max: 70 },
  { name: "Stage", min: 20, max: 80 },
  { name: "Drinks", min: 0, max: 50 },
  { name: "Promotions", min: 10, max: 70 },
];

export default function App() {
  const [allocations, setAllocations] = useState(
    categories.reduce((acc, cat) => ({ ...acc, [cat.name]: 0 }), {})
  );
  const [total, setTotal] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [started, setStarted] = useState(false);
  const [bestCombo, setBestCombo] = useState({
    DJ: 50,
    Lights: 40,
    Stage: 46,
    Drinks: 27,
    Promotions: 37,
  });
  const [result, setResult] = useState("");
  const [confetti, setConfetti] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    setTotal(Object.values(allocations).reduce((a, b) => a + b, 0));
  }, [allocations]);

  useEffect(() => {
    if (started && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (timeLeft === 0) handleSubmit();
  }, [timeLeft, started]);

  const handleChange = (cat, value) => {
    const newAllocations = { ...allocations, [cat]: parseInt(value) };
    setAllocations(newAllocations);
  };

  const handleStart = () => {
    setStarted(true);
    setTimeLeft(120);
    setResult("");
    setConfetti(false);
  };

  const handleSubmit = () => {
    setStarted(false);
    let score = 0;
    for (const key in bestCombo) {
      score += Math.abs(bestCombo[key] - allocations[key]);
    }
    let allClose = true;
    for (const key in bestCombo) {
      if (Math.abs(bestCombo[key] - allocations[key]) > 20) {
        allClose = false;
      }
    }
    if (allClose) {
      setResult("Great job! 🎉 (Within range!)");
      setConfetti(true);
    } else {
      setResult("Better luck next time! 🎧");
    }

    if (playerName.trim()) {
      const newEntry = { name: playerName.trim(), score };
      const updatedBoard = [...leaderboard, newEntry].sort((a, b) => a.score - b.score).slice(0, 3);
      setLeaderboard(updatedBoard);
    }
  };

  const handleReset = () => {
    setAllocations(
      categories.reduce((acc, cat) => ({ ...acc, [cat.name]: 0 }), {})
    );
    setTotal(0);
    setResult("");
    setStarted(false);
    setTimeLeft(120);
    setConfetti(false);
  };

  const handleLeaderboardReset = () => {
    setLeaderboard([]);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0ff, #ff00ff, #00ff99)",
        color: "#fff",
        textAlign: "center",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {confetti && <Confetti />}
      <motion.h1
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 120 }}
        style={{ textShadow: "0 0 15px #000" }}
      >
        🎶 Beat the Budget 🎧
      </motion.h1>
      <p>Allocate exactly <strong>200 coins</strong>. Time left: {Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2,"0")}</p>

      {categories.map(cat => (
        <div key={cat.name} style={{ margin: "15px" }}>
          <label style={{ display: "block", fontSize: "1.2rem", marginBottom: "5px" }}>
            {cat.name}: {allocations[cat.name]} coins
          </label>
          <input
            type="range"
            min={cat.min}
            max={cat.max}
            value={allocations[cat.name]}
            onChange={(e) => handleChange(cat.name, e.target.value)}
            disabled={!started}
            style={{ width: "60%", accentColor: "#ff0" }}
          />
        </div>
      ))}

      <h2 style={{
        color: total === 200 ? "#0f0" : total > 200 ? "#f00" : "#ff0",
        textShadow: total > 200 ? "0 0 20px #f00, 0 0 10px #f00" : "0 0 10px #000",
        animation: total > 200 ? "flash 1s infinite" : "none"
      }}>
        Total: {total}/200
      </h2>

      <p style={{
        color: Object.keys(bestCombo).every(key => Math.abs(bestCombo[key] - allocations[key]) <= 20) ? "#0f0" :
               Object.keys(bestCombo).some(key => Math.abs(bestCombo[key] - allocations[key]) <= 20) ? "#ff0" : "#f00",
        fontWeight: "bold",
        textShadow: "0 0 8px #000"
      }}>
        {Object.keys(bestCombo).every(key => Math.abs(bestCombo[key] - allocations[key]) <= 20)
          ? "You're very close to the best combo!"
          : Object.keys(bestCombo).some(key => Math.abs(bestCombo[key] - allocations[key]) <= 20)
            ? "You're partially matching the best combo."
            : "Far from best combo. Adjust sliders!"}
      </p>

      <div style={{ marginBottom: "15px" }}>
        <input
          type="text"
          placeholder="Enter your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          style={{ padding: "8px", fontSize: "1rem", borderRadius: "5px", border: "1px solid #ccc" }}
          disabled={started}
        />
      </div>

      <div>
        {!started && (
          <button onClick={handleStart} style={btnStyle()}>
            Start
          </button>
        )}
        {started && (
          <button
            onClick={handleSubmit}
            style={btnStyle(total === 200)}
            disabled={total !== 200}
          >
            Submit Budget
          </button>
        )}
        <button onClick={handleReset} style={btnStyle()}>
          Reset
        </button>
      </div>

      {result && (
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ marginTop: "20px", textShadow: "0 0 10px #000" }}
        >
          {result}
        </motion.h2>
      )}
      {result && (
        <div style={{ marginTop: "10px", fontSize: "1rem", textShadow: "0 0 5px #000" }}>
          <p>Best Budget Combo:</p>
          {Object.entries(bestCombo).map(([key, val]) => (
            <p key={key}>{key}: {val} coins</p>
          ))}
        </div>
      )}

      {leaderboard.length > 0 && (
        <div style={{ marginTop: "20px", fontSize: "1rem", textShadow: "0 0 5px #000" }}>
          <h3>Leaderboard (Top 3)</h3>
          {leaderboard.map((entry, index) => (
            <p key={index}>{index + 1}. {entry.name} - Score: {entry.score}</p>
          ))}
          <button onClick={handleLeaderboardReset} style={btnStyle()}>
            Reset Leaderboard
          </button>
        </div>
      )}
    </div>
  );
}

const btnStyle = (enabled = true) => ({
  background: enabled ? "#000" : "#555",
  color: enabled ? "#0ff" : "#888",
  border: "2px solid #0ff",
  padding: "10px 20px",
  margin: "10px",
  cursor: enabled ? "pointer" : "not-allowed",
  borderRadius: "8px",
  fontSize: "1rem",
  opacity: enabled ? 1 : 0.5,
});

const style = document.createElement("style");
style.innerHTML = `
  @keyframes flash {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;
document.head.appendChild(style);