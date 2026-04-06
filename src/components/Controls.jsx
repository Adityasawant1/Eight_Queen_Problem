import { Btn, NavBtn } from "./UI.jsx";
import { TOTAL_SOLUTIONS } from "../utils/solver.js";

export default function Controls({
  n, setN,
  speed, setSpeed,
  isRunning,
  runSolver,
  stop,
  solutionsFound,
  solutions,
  showSolutions, setShowSolutions,
  solutionIdx, showSolution,
  showGallery, setShowGallery,
  isMobile, isTablet,
}) {
  const totalPossible = TOTAL_SOLUTIONS[n] || 0;

  return (
    <>
      {/* Description */}
      <p style={{ margin: 0, fontSize: isMobile ? 12 : 13, color: "#999", lineHeight: 1.75 }}>
        Place <strong style={{ color: "#e8e8e8" }}>n</strong> queens on an{" "}
        <strong style={{ color: "#e8e8e8" }}>n×n</strong> chessboard so that no two queens attack each other.
      </p>

      {/* Sliders */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: isMobile ? 14 : 24,
      }}>
        {[
          {
            label: "Board Size", value: `${n}×${n}`,
            min: 1, max: 12, current: n,
            onChange: e => setN(Number(e.target.value)),
          },
          {
            label: "Speed", value: speed,
            min: 0, max: 3,
            current: ["Slow", "Medium", "Fast", "Instant"].indexOf(speed),
            onChange: e => setSpeed(["Slow", "Medium", "Fast", "Instant"][Number(e.target.value)]),
          },
        ].map(({ label, value, min, max, current, onChange }) => (
          <label key={label} style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12, color: "#aaa" }}>
            <span>{label} <span style={{ color: "#7ed321", fontWeight: 700 }}>{value}</span></span>
            <input type="range" min={min} max={max} value={current}
              disabled={isRunning} onChange={onChange}
              style={{ accentColor: "#4a90d9", width: "100%", maxWidth: 220 }} />
          </label>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: isMobile ? 20 : 40, flexWrap: "wrap" }}>
        {[
          { val: totalPossible, label: "Possible Solutions", color: "#7ed321" },
          { val: solutionsFound, label: "Solutions Found", color: "#f5a623" },
        ].map(({ val, label, color }) => (
          <div key={label}>
            <div style={{ fontSize: isMobile ? 20 : 26, fontWeight: 800, color, letterSpacing: "-0.02em" }}>
              {val.toLocaleString()}
            </div>
            <div style={{ fontSize: 10, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <Btn
          onClick={runSolver} disabled={isRunning}
          bg={isRunning ? "#2a4a1a" : "#7ed321"}
          color={isRunning ? "#555" : "#111"}
          shadow={!isRunning ? "0 0 18px rgba(126,211,33,0.3)" : "none"}
          small={isMobile}
        >Start</Btn>

        <Btn
          onClick={stop} disabled={!isRunning}
          bg={isRunning ? "#555" : "#333"} color="#e8e8e8"
          small={isMobile}
        >Stop</Btn>

        {solutions.length > 0 && (
          <Btn
            onClick={() => setShowSolutions(s => !s)}
            bg={showSolutions ? "#f5a623" : "#2a2208"}
            color={showSolutions ? "#111" : "#f5a623"}
            border="1px solid #f5a623"
            small={isMobile}
          >Solutions</Btn>
        )}

        {showSolutions && solutions.length > 0 && (
          <>
            <NavBtn onClick={() => showSolution(Math.max(0, solutionIdx - 1))} disabled={solutionIdx === 0}>◀</NavBtn>
            <span style={{ fontSize: 12, color: "#777" }}>{solutionIdx + 1}/{solutions.length}</span>
            <NavBtn onClick={() => showSolution(Math.min(solutions.length - 1, solutionIdx + 1))} disabled={solutionIdx === solutions.length - 1}>▶</NavBtn>
          </>
        )}

        {(isMobile || isTablet) && solutions.length > 0 && (
          <Btn
            onClick={() => setShowGallery(g => !g)}
            bg={showGallery ? "#4a90d9" : "#0d1e30"}
            color={showGallery ? "#fff" : "#4a90d9"}
            border="1px solid #4a90d9"
            small={isMobile}
          >Gallery</Btn>
        )}
      </div>
    </>
  );
}