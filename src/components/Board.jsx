export default function Board({ board, n, cellSize, boardPx, attackedCells }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${n}, ${cellSize}px)`,
      gridTemplateRows: `repeat(${n}, ${cellSize}px)`,
      width: boardPx,
      height: boardPx,
      border: "2px solid #3a3a45",
      boxShadow: "0 6px 32px rgba(0,0,0,0.55)",
      borderRadius: 4,
      overflow: "hidden",
      flexShrink: 0,
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
                  fontSize: Math.max(10, cellSize * 0.62),
                  lineHeight: 1,
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
                  color: "#111",
                  animation: "queenPop 0.25s cubic-bezier(0.175,0.885,0.32,1.275)",
                  display: "block",
                  userSelect: "none",
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