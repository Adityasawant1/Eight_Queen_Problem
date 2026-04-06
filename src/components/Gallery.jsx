export default function Gallery({ solutions, n, solutionIdx, showSolutions, onSelect, columns, cellSize }) {
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
            borderRadius: 6,
            overflow: "hidden",
            boxShadow: selected ? "0 0 12px rgba(245,166,35,0.28)" : "none",
            transition: "all 0.15s",
          }}>
            {/* Card header */}
            <div style={{
              padding: "3px 6px",
              background: selected ? "#2a1e08" : "#181820",
              fontSize: 9,
              color: selected ? "#f5a623" : "#444",
            }}>
              #{i + 1}
            </div>

            {/* Mini board */}
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
                      fontSize: actualCellSize * 0.72,
                      userSelect: "none",
                    }}>
                      {hasQueen && actualCellSize >= 12
                        ? <span style={{ color: "#111" }}>♛</span>
                        : null}
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