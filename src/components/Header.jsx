export default function Header({ isMobile, currentView, setView }) {
  return (
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
        {["Home", "Visualize"].map(v => {
          const isActive = currentView === v.toLowerCase();
          return (
            <button key={v} onClick={() => setView(v.toLowerCase())} style={{
              background: "none", border: "none",
              borderBottom: isActive ? "2px solid #7ed321" : "2px solid transparent",
              cursor: "pointer",
              color: isActive ? "#7ed321" : "#666",
              fontSize: isMobile ? 12 : 14, fontFamily: "inherit",
              letterSpacing: "0.05em", fontWeight: 700, padding: "3px 0",
              transition: "color 0.2s, border-color 0.2s",
            }}>{v}</button>
          );
        })}
      </nav>
    </header>
  );
}