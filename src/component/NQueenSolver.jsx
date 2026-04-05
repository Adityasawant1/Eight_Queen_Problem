import { useState, useEffect, useRef, useCallback } from "react";

const SPEEDS = { Slow: 600, Medium: 200, Fast: 40, Instant: 0 };
const TOTAL_SOLUTIONS = { 1:1,2:0,3:0,4:2,5:10,6:4,7:40,8:92,9:352,10:724,11:2680,12:14200 };

function solveNQueens(n) {
  const solutions = [];
  const board = Array(n).fill(-1);
  function isSafe(row, col) {
    for (let r = 0; r < row; r++)
      if (board[r] === col || Math.abs(board[r] - col) === Math.abs(r - row)) return false;
    return true;
  }
  function solve(row) {
    if (row === n) { solutions.push([...board]); return; }
    for (let col = 0; col < n; col++)
      if (isSafe(row, col)) { board[row] = col; solve(row + 1); board[row] = -1; }
  }
  solve(0);
  return solutions;
}

function useWindowSize() {
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const handler = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return size;
}

export default function NQueenSolver() {
  const [n, setN] = useState(8);
  const [board, setBoard] = useState(Array(8).fill(-1));
  const [isRunning, setIsRunning] = useState(false);
  const [solutions, setSolutions] = useState([]);
  const [solutionsFound, setSolutionsFound] = useState(0);
  const [speed, setSpeed] = useState("Fast");
  const [solutionIdx, setSolutionIdx] = useState(0);
  const [showSolutions, setShowSolutions] = useState(false);
  const [attackedCells, setAttackedCells] = useState(new Set());
  const [showGallery, setShowGallery] = useState(false);
  const stopRef = useRef(false);
  const { w } = useWindowSize();

  const isMobile = w < 640;
  const isTablet = w >= 640 && w < 1024;
  const totalPossible = TOTAL_SOLUTIONS[n] || 0;

  const getAttackedCells = (currentBoard, size) => {
    const attacked = new Set();
    for (let r = 0; r < size; r++) {
      const col = currentBoard[r];
      if (col === -1) continue;
      for (let c = 0; c < size; c++) if (c !== col) attacked.add(`${r},${c}`);
      for (let dr = -size; dr <= size; dr++) {
        if (dr === 0) continue;
        const nr = r + dr, nc = col + dr, nc2 = col - dr;
        if (nr >= 0 && nr < size) {
          if (nc >= 0 && nc < size) attacked.add(`${nr},${nc}`);
          if (nc2 >= 0 && nc2 < size) attacked.add(`${nr},${nc2}`);
        }
      }
      for (let rr = 0; rr < size; rr++) if (rr !== r) attacked.add(`${rr},${col}`);
    }
    return attacked;
  };

  const runSolver = useCallback(async () => {
    stopRef.current = false;
    setIsRunning(true);
    setSolutionsFound(0);
    setSolutions([]);
    setBoard(Array(n).fill(-1));
    setAttackedCells(new Set());

    const ms = SPEEDS[speed];

    if (ms === 0) {
      const allSolutions = solveNQueens(n);
      setSolutions(allSolutions);
      setSolutionsFound(allSolutions.length);
      setIsRunning(false);
      setBoard(Array(n).fill(-1));
      return;
    }

    const foundSolutions = [];
    const b = Array(n).fill(-1);

    function isSafe(row, col) {
      for (let r = 0; r < row; r++)
        if (b[r] === col || Math.abs(b[r] - col) === Math.abs(r - row)) return false;
      return true;
    }

    const steps = [];
    function buildSteps(row) {
      if (row === n) { steps.push({ type: "solution", board: [...b] }); return; }
      for (let col = 0; col < n; col++) {
        steps.push({ type: "place", row, col });
        b[row] = col;
        if (isSafe(row, col)) buildSteps(row + 1);
        steps.push({ type: "remove", row, col });
        b[row] = -1;
      }
    }
    buildSteps(0);

    const currBoard = Array(n).fill(-1);
    let i = 0;

    await new Promise((resolve) => {
      function processStep() {
        if (stopRef.current || i >= steps.length) { resolve(); return; }
        const step = steps[i++];
        if (step.type === "place") {
          currBoard[step.row] = step.col;
          setBoard([...currBoard]);
          setAttackedCells(getAttackedCells(currBoard, n));
        } else if (step.type === "remove") {
          currBoard[step.row] = -1;
          setBoard([...currBoard]);
          setAttackedCells(getAttackedCells(currBoard, n));
        } else if (step.type === "solution") {
          foundSolutions.push([...step.board]);
          setSolutionsFound(foundSolutions.length);
          setSolutions([...foundSolutions]);
          setTimeout(processStep, ms * 3);
          return;
        }
        setTimeout(processStep, ms);
      }
      processStep();
    });

    if (!stopRef.current) {
      setIsRunning(false);
      setBoard(Array(n).fill(-1));
      setAttackedCells(new Set());
    }
  }, [n, speed]);

  const stop = () => {
    stopRef.current = true;
    setIsRunning(false);
    setBoard(Array(n).fill(-1));
    setAttackedCells(new Set());
  };

  const showSolution = (idx) => {
    if (!solutions[idx]) return;
    setSolutionIdx(idx);
    setBoard([...solutions[idx]]);
    setAttackedCells(new Set());
  };

  useEffect(() => {
    stop();
    setSolutions([]);
    setSolutionsFound(0);
    setBoard(Array(n).fill(-1));
    setAttackedCells(new Set());
    setShowSolutions(false);
  }, [n]);

  const boardToDisplay = showSolutions && solutions[solutionIdx] ? solutions[solutionIdx] : board;

  const GALLERY_W = 660;
  const hPad = isMobile ? 16 : 32;
  const availableWidth = isMobile
    ? w - hPad * 2
    : isTablet
    ? Math.min(w * 0.6, 440)
    : Math.min((w - GALLERY_W) * 0.78, 520);

  const cellSize = Math.max(20, Math.floor(availableWidth / n));
  const boardPx = cellSize * n;

  const galleryColumns = isMobile ? 3 : isTablet ? 4 : 3;
  const galleryPanelWidth = isMobile ? w - hPad * 2 : isTablet ? w - hPad * 2 : GALLERY_W - 36;
  const miniCellSize = Math.max(4, Math.floor((galleryPanelWidth / galleryColumns - 18) / n));

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f0f13",
      fontFamily: "'Courier New', monospace",
      color: "#e8e8e8",
      display: "flex",
      flexDirection: "column",
    }}>
      <style>{`
        @keyframes queenPop {
          0% { transform: scale(0) rotate(-20deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        *, *::before, *::after { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #0f0f13; }
        ::-webkit-scrollbar-thumb { background: #2a2a35; border-radius: 3px; }
      `}</style>

      {/* Header */}
      <header style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: isMobile ? "12px 16px" : "14px 32px",
        borderBottom: "1px solid #2a2a35",
        background: "rgba(15,15,19,0.97)",
        backdropFilter: "blur(10px)",
        position: "sticky", top: 0, zIndex: 100,
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: isMobile ? 20 : 26 }}>♛</span>
          <span style={{ fontSize: isMobile ? 15 : 19, fontWeight: 700, letterSpacing: "0.1em", color: "#fff" }}>
            n-Queen
          </span>
        </div>
        <nav style={{ display: "flex", gap: isMobile ? 14 : 28 }}>
          {["Home", "Visualize"].map(v => (
            <button key={v} style={{
              background: "none", border: "none", borderBottom: "2px solid #7ed321",
              cursor: "pointer", color: "#7ed321",
              fontSize: isMobile ? 12 : 14, fontFamily: "inherit",
              letterSpacing: "0.05em", fontWeight: 700, padding: "3px 0",
            }}>{v}</button>
          ))}
        </nav>
      </header>

      {/* Main layout */}
      <div style={{
        display: "flex",
        flexDirection: isMobile || isTablet ? "column" : "row",
        flex: 1,
        overflow: "hidden",
      }}>

        {/* Left / main panel */}
        <div style={{
          flex: 1,
          padding: isMobile ? "18px 16px" : "24px 32px",
          display: "flex", flexDirection: "column", gap: 18,
          overflowY: "auto",
          borderRight: !isMobile && !isTablet ? "1px solid #2a2a35" : "none",
          borderBottom: isMobile || isTablet ? "1px solid #2a2a35" : "none",
        }}>

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
                current: ["Slow","Medium","Fast","Instant"].indexOf(speed),
                onChange: e => setSpeed(["Slow","Medium","Fast","Instant"][Number(e.target.value)]),
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

          {/* Buttons */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <Btn onClick={runSolver} disabled={isRunning}
              bg={isRunning ? "#2a4a1a" : "#7ed321"}
              color={isRunning ? "#555" : "#111"}
              shadow={!isRunning ? "0 0 18px rgba(126,211,33,0.3)" : "none"}
              small={isMobile}>Start</Btn>

            <Btn onClick={stop} disabled={!isRunning}
              bg={isRunning ? "#555" : "#333"} color="#e8e8e8"
              small={isMobile}>Stop</Btn>

            {solutions.length > 0 && (
              <Btn onClick={() => setShowSolutions(s => !s)}
                bg={showSolutions ? "#f5a623" : "#2a2208"}
                color={showSolutions ? "#111" : "#f5a623"}
                border="1px solid #f5a623"
                small={isMobile}>Solutions</Btn>
            )}

            {showSolutions && solutions.length > 0 && (
              <>
                <NavBtn onClick={() => showSolution(Math.max(0, solutionIdx - 1))}
                  disabled={solutionIdx === 0}>◀</NavBtn>
                <span style={{ fontSize: 12, color: "#777" }}>
                  {solutionIdx + 1}/{solutions.length}
                </span>
                <NavBtn onClick={() => showSolution(Math.min(solutions.length - 1, solutionIdx + 1))}
                  disabled={solutionIdx === solutions.length - 1}>▶</NavBtn>
              </>
            )}

            {(isMobile || isTablet) && solutions.length > 0 && (
              <Btn onClick={() => setShowGallery(g => !g)}
                bg={showGallery ? "#4a90d9" : "#0d1e30"}
                color={showGallery ? "#fff" : "#4a90d9"}
                border="1px solid #4a90d9"
                small={isMobile}>Gallery</Btn>
            )}
          </div>

          {/* Board */}
          <div style={{ display: "flex", justifyContent: isMobile ? "center" : "flex-start" }}>
            <Board board={boardToDisplay} n={n} cellSize={cellSize} boardPx={boardPx}
              attackedCells={!showSolutions ? attackedCells : new Set()} />
          </div>

          {/* Inline gallery on mobile/tablet */}
          {(isMobile || isTablet) && showGallery && solutions.length > 0 && (
            <div style={{ marginTop: 4 }}>
              <SectionLabel>Solution Gallery</SectionLabel>
              <Gallery solutions={solutions} n={n} solutionIdx={solutionIdx}
                showSolutions={showSolutions} onSelect={(i) => { setShowSolutions(true); showSolution(i); }}
                columns={galleryColumns} cellSize={miniCellSize} />
            </div>
          )}
        </div>

        {/* Right panel — desktop only */}
        {!isMobile && !isTablet && (
          <div style={{
            width: GALLERY_W, padding: "24px 20px", overflowY: "auto",
            background: "#0d0d11", flexShrink: 0,
          }}>
            <SectionLabel>Solution Gallery</SectionLabel>
            {solutions.length === 0 ? (
              <div style={{ color: "#2e2e38", fontSize: 13, marginTop: 60, textAlign: "center" }}>
                <div style={{ fontSize: 34, marginBottom: 12 }}>♛</div>
                Run the solver to see solutions appear here
              </div>
            ) : (
              <Gallery solutions={solutions} n={n} solutionIdx={solutionIdx}
                showSolutions={showSolutions} onSelect={(i) => { setShowSolutions(true); showSolution(i); }}
                columns={3} cellSize={miniCellSize} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ──

function Btn({ children, onClick, disabled, bg, color, border, shadow, small }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: small ? "8px 18px" : "9px 24px",
      borderRadius: 24, border: border || "none", cursor: disabled ? "not-allowed" : "pointer",
      background: bg, color, fontWeight: 700, fontSize: small ? 12 : 13,
      fontFamily: "inherit", letterSpacing: "0.05em",
      transition: "all 0.2s", boxShadow: shadow || "none",
      opacity: disabled ? 0.5 : 1,
    }}>{children}</button>
  );
}

function NavBtn({ children, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: 32, height: 32, borderRadius: 6, border: "none",
      cursor: disabled ? "not-allowed" : "pointer",
      background: "#2a2a35", color: "#e8e8e8", fontSize: 13,
      display: "flex", alignItems: "center", justifyContent: "center",
      opacity: disabled ? 0.35 : 1, transition: "opacity 0.15s",
    }}>{children}</button>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 10, color: "#444", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>
      {children}
    </div>
  );
}

function Board({ board, n, cellSize, boardPx, attackedCells }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${n}, ${cellSize}px)`,
      gridTemplateRows: `repeat(${n}, ${cellSize}px)`,
      width: boardPx, height: boardPx,
      border: "2px solid #3a3a45",
      boxShadow: "0 6px 32px rgba(0,0,0,0.55)",
      borderRadius: 4, overflow: "hidden", flexShrink: 0,
    }}>
      {Array.from({ length: n }, (_, r) =>
        Array.from({ length: n }, (_, c) => {
          const isLight = (r + c) % 2 === 0;
          const hasQueen = board[r] === c;
          const isAttacked = attackedCells.has(`${r},${c}`) && !hasQueen;

          let bg = isLight ? "#c8d8a0" : "#5a8a5a";
          if (isAttacked) bg = isLight ? "rgba(220,80,80,0.2)" : "rgba(220,80,80,0.32)";
          if (hasQueen) bg = isLight ? "#d4e08a" : "#6a9a6a";

          return (
            <div key={`${r},${c}`} style={{
              width: cellSize, height: cellSize, background: bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.12s",
            }}>
              {hasQueen && (
                <span style={{
                  fontSize: Math.max(10, cellSize * 0.62), lineHeight: 1,
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
                  color: "#111",
                  animation: "queenPop 0.25s cubic-bezier(0.175,0.885,0.32,1.275)",
                  display: "block", userSelect: "none",
                }}>♛</span>
              )}
              {isAttacked && !hasQueen && cellSize > 18 && (
                <span style={{ fontSize: cellSize * 0.28, opacity: 0.4, color: "#c0392b", userSelect: "none" }}>×</span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

function Gallery({ solutions, n, solutionIdx, showSolutions, onSelect, columns, cellSize }) {
  const actualCellSize = Math.max(4, cellSize);
  const boardW = actualCellSize * n;

  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 8 }}>
      {solutions.map((sol, i) => {
        const selected = showSolutions && solutionIdx === i;
        return (
          <div key={i} onClick={() => onSelect(i)} style={{
            cursor: "pointer",
            border: selected ? "2px solid #f5a623" : "2px solid #252530",
            borderRadius: 6, overflow: "hidden",
            boxShadow: selected ? "0 0 12px rgba(245,166,35,0.28)" : "none",
            transition: "all 0.15s",
          }}>
            <div style={{
              padding: "3px 6px",
              background: selected ? "#2a1e08" : "#181820",
              fontSize: 9, color: selected ? "#f5a623" : "#444",
            }}>#{i + 1}</div>
            <div style={{
              display: "grid",
              gridTemplateColumns: `repeat(${n}, ${actualCellSize}px)`,
              width: boardW,
            }}>
              {Array.from({ length: n }, (_, r) =>
                Array.from({ length: n }, (_, c) => {
                  const isLight = (r + c) % 2 === 0;
                  const hasQueen = sol[r] === c;
                  return (
                    <div key={`${r},${c}`} style={{
                      width: actualCellSize, height: actualCellSize,
                      background: hasQueen ? "#4a7a30" : (isLight ? "#c8d8a0" : "#5a8a5a"),
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: actualCellSize * 0.72, userSelect: "none",
                    }}>
                      {hasQueen && actualCellSize >= 12 ? <span style={{color:"#111"}}>♛</span> : null}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}