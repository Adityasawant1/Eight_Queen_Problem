export function Btn({ children, onClick, disabled, bg, color, border, shadow, small }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: small ? "8px 18px" : "9px 24px",
      borderRadius: 24,
      border: border || "none",
      cursor: disabled ? "not-allowed" : "pointer",
      background: bg,
      color,
      fontWeight: 700,
      fontSize: small ? 12 : 13,
      fontFamily: "inherit",
      letterSpacing: "0.05em",
      transition: "all 0.2s",
      boxShadow: shadow || "none",
      opacity: disabled ? 0.5 : 1,
    }}>
      {children}
    </button>
  );
}

export function NavBtn({ children, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: 32, height: 32,
      borderRadius: 6, border: "none",
      cursor: disabled ? "not-allowed" : "pointer",
      background: "#2a2a35", color: "#e8e8e8", fontSize: 13,
      display: "flex", alignItems: "center", justifyContent: "center",
      opacity: disabled ? 0.35 : 1,
      transition: "opacity 0.15s",
    }}>
      {children}
    </button>
  );
}

export function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 10, color: "#444",
      letterSpacing: "0.12em", textTransform: "uppercase",
      marginBottom: 14,
    }}>
      {children}
    </div>
  );
}