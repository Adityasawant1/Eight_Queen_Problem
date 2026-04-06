import { useState } from "react";

const SECTIONS = [
  {
    id: "what",
    title: "What is the N-Queens Problem?",
    icon: "♛",
    content: `The N-Queens puzzle is the challenge of placing N chess queens on an N×N chessboard so that no two queens threaten each other. A queen can attack any piece in the same row, column, or diagonal — so each queen must occupy a unique row, column, and diagonal.

The 8-Queens problem (placing 8 queens on an 8×8 board) has exactly 92 distinct solutions. As N grows, the number of solutions explodes: 12-Queens has 14,200 solutions, and 20-Queens has over 39 billion.

This problem is a classic benchmark for backtracking algorithms and constraint satisfaction techniques in computer science.`,
    code: null,
  },
  {
    id: "constraints",
    title: "The Constraints",
    icon: "⚔",
    content: "For any two queens at positions (r1, c1) and (r2, c2), all three conditions must hold:",
    code: `// No two queens share the same column
c1 !== c2

// No two queens share the same main diagonal (top-left to bottom-right)
Math.abs(r1 - r2) !== Math.abs(c1 - c2)

// No two queens share the same row
// (guaranteed by placing exactly one queen per row)`,
  },
  {
    id: "issafe",
    title: "isSafe — Checking a Placement",
    icon: "✔",
    content: "Before placing a queen in (row, col), we check all previously placed queens (rows 0 to row-1). Since we place one queen per row, we only need to check column conflicts and diagonal conflicts:",
    code: `function isSafe(board, row, col) {
  for (let r = 0; r < row; r++) {
    const placedCol = board[r];

    // Same column?
    if (placedCol === col) return false;

    // Same diagonal?
    if (Math.abs(placedCol - col) === Math.abs(r - row)) return false;
  }
  return true;
}`,
  },
  {
    id: "backtracking",
    title: "Backtracking Algorithm",
    icon: "↩",
    content: "The core idea: place queens row by row. For each row, try every column. If a placement is safe, recurse to the next row. If no column works, backtrack — undo the last placement and try the next option.",
    code: `function solveNQueens(n) {
  const solutions = [];
  const board = Array(n).fill(-1); // board[r] = column of queen in row r

  function solve(row) {
    // All queens placed — record this solution
    if (row === n) {
      solutions.push([...board]);
      return;
    }

    for (let col = 0; col < n; col++) {
      if (isSafe(board, row, col)) {
        board[row] = col;   // place queen
        solve(row + 1);     // recurse
        board[row] = -1;    // backtrack
      }
    }
  }

  solve(0);
  return solutions;
}

// Usage
const solutions = solveNQueens(8);
console.log(\`Found \${solutions.length} solutions\`); // Found 92 solutions`,
  },
  {
    id: "complexity",
    title: "Time & Space Complexity",
    icon: "📊",
    content: "Backtracking prunes many invalid branches early, making it far faster than brute force — but the worst-case is still exponential.",
    code: `// Brute force: try every arrangement of N queens across N² cells
// Time: O(N^(2N)) — astronomically slow

// Backtracking: place one queen per row, prune invalid columns
// Time: O(N!) in the worst case (much better in practice due to pruning)
// Space: O(N) — only the current board path is stored on the call stack

// Example solution counts:
const solutions = {
  1:  1,
  4:  2,
  5:  10,
  6:  4,
  8:  92,       // the classic "Eight Queens" problem
  10: 724,
  12: 14200,
};`,
  },
  {
    id: "oneliner",
    title: "Compact One-liner Version",
    icon: "⚡",
    content: "Here's a condensed functional version using Array methods — same algorithm, different style:",
    code: `const nQueens = n => {
  const solve = (board, row) =>
    row === n
      ? [board]
      : [...Array(n).keys()]
          .filter(col =>
            board.every(
              (c, r) => c !== col && Math.abs(c - col) !== row - r
            )
          )
          .flatMap(col => solve([...board, col], row + 1));

  return solve([], 0);
};

// Returns array of solutions, each solution is an array of column indices
// E.g. [0, 4, 7, 5, 2, 6, 1, 3] means:
//   Row 0 → Col 0, Row 1 → Col 4, Row 2 → Col 7 ...
console.log(nQueens(8).length); // 92`,
  },
  {
    id: "visualize",
    title: "Printing a Solution",
    icon: "🖨",
    content: "Once you have a solution array, rendering it as a visual board is straightforward:",
    code: `function printBoard(solution) {
  const n = solution.length;
  for (let row = 0; row < n; row++) {
    const line = Array(n)
      .fill(".")
      .map((cell, col) => (col === solution[row] ? "Q" : "."))
      .join(" ");
    console.log(line);
  }
}

// Example output for one 8-Queens solution:
// Q . . . . . . .
// . . . . Q . . .
// . . . . . . . Q
// . . . . . Q . .
// . . Q . . . . .
// . . . . . . Q .
// . Q . . . . . .
// . . . Q . . . .`,
  },
];

function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ position: "relative", marginTop: 12 }}>
      <button onClick={copy} style={{
        position: "absolute", top: 10, right: 10,
        background: copied ? "#2a4a1a" : "#2a2a35",
        border: "1px solid " + (copied ? "#7ed321" : "#3a3a45"),
        color: copied ? "#7ed321" : "#888",
        borderRadius: 6, padding: "4px 10px",
        fontSize: 11, cursor: "pointer", fontFamily: "inherit",
        transition: "all 0.2s", zIndex: 1,
      }}>
        {copied ? "✔ Copied" : "Copy"}
      </button>
      <pre style={{
        margin: 0,
        padding: "16px 20px",
        paddingRight: 70,
        background: "#0a0a0e",
        border: "1px solid #2a2a35",
        borderRadius: 8,
        overflowX: "auto",
        fontSize: 13,
        lineHeight: 1.7,
        color: "#c8d8a0",
        fontFamily: "'Courier New', monospace",
      }}>
        <code>{highlight(code)}</code>
      </pre>
    </div>
  );
}

// Simple syntax highlighter
function highlight(code) {
  const keywords = ["function", "return", "const", "let", "for", "if", "else", "new", "true", "false", "of"];
  const lines = code.split("\n");

  return lines.map((line, li) => {
    // Comments
    if (line.trim().startsWith("//")) {
      return (
        <span key={li}>
          <span style={{ color: "#5a6a3a", fontStyle: "italic" }}>{line}</span>
          {"\n"}
        </span>
      );
    }

    // Tokenize roughly
    const parts = line.split(/(\b\w+\b|[(){}\[\],;.!=<>+\-*\/]|"[^"]*"|`[^`]*`|'[^']*'|\s+)/g).filter(Boolean);

    return (
      <span key={li}>
        {parts.map((part, pi) => {
          if (keywords.includes(part))
            return <span key={pi} style={{ color: "#c678dd" }}>{part}</span>;
          if (/^\d+$/.test(part))
            return <span key={pi} style={{ color: "#d19a66" }}>{part}</span>;
          if (/^["'`]/.test(part))
            return <span key={pi} style={{ color: "#98c379" }}>{part}</span>;
          if (/^[A-Z]/.test(part))
            return <span key={pi} style={{ color: "#e5c07b" }}>{part}</span>;
          if (/^[a-z][a-zA-Z]*(?=\()/.test(part))
            return <span key={pi} style={{ color: "#61afef" }}>{part}</span>;
          return <span key={pi}>{part}</span>;
        })}
        {"\n"}
      </span>
    );
  });
}

export default function HomePage({ isMobile }) {
  const [openSection, setOpenSection] = useState("what");

  return (
    <div style={{
      maxWidth: 860,
      margin: "0 auto",
      padding: isMobile ? "24px 16px" : "40px 32px",
      display: "flex",
      flexDirection: "column",
      gap: 12,
    }}>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #1a1a24 0%, #0f0f13 100%)",
        border: "1px solid #2a2a35",
        borderRadius: 12,
        padding: isMobile ? "28px 20px" : "40px 48px",
        marginBottom: 8,
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -20, right: -20,
          fontSize: 160, opacity: 0.04, lineHeight: 1,
          userSelect: "none", pointerEvents: "none",
        }}>♛</div>
        <div style={{
          display: "inline-block",
          background: "#1e2e10",
          border: "1px solid #7ed321",
          borderRadius: 20,
          padding: "4px 14px",
          fontSize: 11,
          color: "#7ed321",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 16,
        }}>Classic Algorithm Problem</div>
        <h1 style={{
          margin: "0 0 12px",
          fontSize: isMobile ? 26 : 36,
          fontWeight: 800,
          color: "#fff",
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
        }}>
          The Eight Queens<br />
          <span style={{ color: "#7ed321" }}>Puzzle</span>
        </h1>
        <p style={{
          margin: "0 0 24px",
          fontSize: isMobile ? 13 : 15,
          color: "#888",
          lineHeight: 1.8,
          maxWidth: 520,
        }}>
          A fundamental computer science problem solved elegantly with backtracking.
          Explore the algorithm, constraints, complexity, and JavaScript implementations below.
        </p>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {[
            { label: "8×8 Board", val: "8 Queens" },
            { label: "Unique Solutions", val: "92" },
            { label: "Algorithm", val: "Backtracking" },
            { label: "Complexity", val: "O(N!)" },
          ].map(({ label, val }) => (
            <div key={label}>
              <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: "#f5a623" }}>{val}</div>
              <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Accordion Sections */}
      {SECTIONS.map(section => {
        const isOpen = openSection === section.id;
        return (
          <div key={section.id} style={{
            border: "1px solid " + (isOpen ? "#3a4a2a" : "#2a2a35"),
            borderRadius: 10,
            overflow: "hidden",
            transition: "border-color 0.2s",
            background: isOpen ? "#111116" : "#0d0d11",
          }}>
            {/* Accordion Header */}
            <button
              onClick={() => setOpenSection(isOpen ? null : section.id)}
              style={{
                width: "100%", display: "flex", alignItems: "center",
                justifyContent: "space-between",
                padding: isMobile ? "14px 16px" : "16px 24px",
                background: "none", border: "none", cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: isOpen ? "#1e2e10" : "#1a1a22",
                  border: "1px solid " + (isOpen ? "#7ed321" : "#2a2a35"),
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, flexShrink: 0,
                  transition: "all 0.2s",
                }}>{section.icon}</span>
                <span style={{
                  fontSize: isMobile ? 13 : 15,
                  fontWeight: 700,
                  color: isOpen ? "#e8e8e8" : "#aaa",
                  fontFamily: "'Courier New', monospace",
                  letterSpacing: "0.02em",
                  transition: "color 0.2s",
                }}>{section.title}</span>
              </div>
              <span style={{
                color: isOpen ? "#7ed321" : "#444",
                fontSize: 18,
                transition: "transform 0.2s, color 0.2s",
                transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                flexShrink: 0,
              }}>▾</span>
            </button>

            {/* Accordion Body */}
            {isOpen && (
              <div style={{ padding: isMobile ? "0 16px 20px" : "0 24px 24px" }}>
                <div style={{
                  height: 1, background: "#2a2a35", marginBottom: 18,
                }} />
                <p style={{
                  margin: "0 0 4px",
                  fontSize: isMobile ? 13 : 14,
                  color: "#999",
                  lineHeight: 1.9,
                  whiteSpace: "pre-line",
                }}>{section.content}</p>
                {section.code && <CodeBlock code={section.code} />}
              </div>
            )}
          </div>
        );
      })}

      {/* Footer hint */}
      <div style={{
        marginTop: 8,
        padding: "16px 20px",
        background: "#0d1e30",
        border: "1px solid #1a3a50",
        borderRadius: 10,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <span style={{ fontSize: 22 }}>▶</span>
        <span style={{ fontSize: isMobile ? 12 : 13, color: "#7abadd", lineHeight: 1.6 }}>
          Ready to see it in action? Click <strong style={{ color: "#fff" }}>Visualize</strong> in the header to watch the backtracking algorithm find all 92 solutions live on the board.
        </span>
      </div>
    </div>
  );
}