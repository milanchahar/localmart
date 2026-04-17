export default function Spinner({ label = "Loading…" }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "80px 20px", gap: 16,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: "50%",
        border: "3.5px solid #e2e8f0",
        borderTopColor: "#6366f1",
        animation: "spin 0.75s linear infinite",
      }} />
      <p style={{ margin: 0, fontSize: 13.5, color: "#94a3b8", fontWeight: 500 }}>{label}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
