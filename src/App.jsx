import { useState, useEffect, useRef, useCallback } from "react";

import Header from "./components/Header.jsx";
import Board from "./components/Board.jsx";
import Gallery from "./components/Gallery.jsx";
import Controls from "./components/Controls.jsx";
import HomePage from "./components/HomePage.jsx";
import { SectionLabel } from "./components/UI.jsx";
import { useWindowSize } from "./hooks/useWindowSize.js";
import {
  solveNQueens,
  getAttackedCells,
  buildAnimationSteps,
  SPEEDS,
} from "./utils/solver.js";

const GALLERY_W = 660;

export default function App() {
  const [currentView, setCurrentView] = useState("home");

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

  // ── Derived layout sizes ───────────────────────────────────────────────────
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

  // ── Solver logic ───────────────────────────────────────────────────────────
  const stop = useCallback(() => {
    stopRef.current = true;
    setIsRunning(false);
    setBoard(Array(n).fill(-1));
    setAttackedCells(new Set());
  }, [n]);

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
    const steps = buildAnimationSteps(n);
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

  const showSolution = (idx) => {
    if (!solutions[idx]) return;
    setSolutionIdx(idx);
    setBoard([...solutions[idx]]);
    setAttackedCells(new Set());
  };

  useEffect(() => {
    stopRef.current = true;
    setIsRunning(false);
    setSolutions([]);
    setSolutionsFound(0);
    setBoard(Array(n).fill(-1));
    setAttackedCells(new Set());
    setShowSolutions(false);
  }, [n]);

  const boardToDisplay = showSolutions && solutions[solutionIdx] ? solutions[solutionIdx] : board;

  // ── Render ─────────────────────────────────────────────────────────────────
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
          0%   { transform: scale(0) rotate(-20deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg);  opacity: 1; }
        }
        *, *::before, *::after { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #0f0f13; }
        ::-webkit-scrollbar-thumb { background: #2a2a35; border-radius: 3px; }
      `}</style>

      <Header isMobile={isMobile} currentView={currentView} setView={setCurrentView} />

      {/* ── Home Page ── */}
      {currentView === "home" && (
        <div style={{ flex: 1, overflowY: "auto" }}>
          <HomePage isMobile={isMobile} onVisualize={() => setCurrentView("visualize")} />
        </div>
      )}

      {/* ── Visualize Page ── */}
      {currentView === "visualize" && (
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
            <Controls
              n={n} setN={setN}
              speed={speed} setSpeed={setSpeed}
              isRunning={isRunning}
              runSolver={runSolver}
              stop={stop}
              solutionsFound={solutionsFound}
              solutions={solutions}
              showSolutions={showSolutions} setShowSolutions={setShowSolutions}
              solutionIdx={solutionIdx} showSolution={showSolution}
              showGallery={showGallery} setShowGallery={setShowGallery}
              isMobile={isMobile} isTablet={isTablet}
            />

            <div style={{ display: "flex", justifyContent: isMobile ? "center" : "flex-start" }}>
              <Board
                board={boardToDisplay}
                n={n}
                cellSize={cellSize}
                boardPx={boardPx}
                attackedCells={!showSolutions ? attackedCells : new Set()}
              />
            </div>

            {(isMobile || isTablet) && showGallery && solutions.length > 0 && (
              <div style={{ marginTop: 4 }}>
                <SectionLabel>Solution Gallery</SectionLabel>
                <Gallery
                  solutions={solutions} n={n}
                  solutionIdx={solutionIdx} showSolutions={showSolutions}
                  onSelect={(i) => { setShowSolutions(true); showSolution(i); }}
                  columns={galleryColumns} cellSize={miniCellSize}
                />
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
                <Gallery
                  solutions={solutions} n={n}
                  solutionIdx={solutionIdx} showSolutions={showSolutions}
                  onSelect={(i) => { setShowSolutions(true); showSolution(i); }}
                  columns={3} cellSize={miniCellSize}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}