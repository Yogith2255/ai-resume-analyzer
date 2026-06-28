import { FiMenu } from "react-icons/fi";
import useAuth from "../../hooks/useAuth";

export default function Header({ toggleSidebar }) {
  const { user } = useAuth();
  
  // Format current date nicely
  const getFormattedDate = () => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <header style={{
      height: "70px",
      padding: "0 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: "1px solid var(--border-color)",
      backgroundColor: "rgba(11, 15, 25, 0.8)",
      backdropFilter: "var(--blur-glass)",
      WebkitBackdropFilter: "var(--blur-glass)",
      position: "sticky",
      top: 0,
      zIndex: 900
    }}>
      {/* Mobile Toggle & Greeting */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button 
          onClick={toggleSidebar}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-main)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            padding: "8px",
            borderRadius: "8px",
            backgroundColor: "rgba(255, 255, 255, 0.03)"
          }}
          className="mobile-toggle"
        >
          <FiMenu size={20} />
        </button>

        <h1 style={{
          fontSize: "16px",
          fontWeight: "600",
          color: "var(--text-main)",
          margin: 0
        }} className="greeting">
          Welcome back, <span style={{ color: "var(--primary)" }}>{user?.name || "Developer"}</span>
        </h1>
      </div>

      {/* Date Badge */}
      <div style={{
        fontSize: "13px",
        color: "var(--text-muted)",
        backgroundColor: "rgba(255, 255, 255, 0.04)",
        border: "1px solid var(--border-color)",
        padding: "6px 14px",
        borderRadius: "20px",
        fontWeight: "500"
      }}>
        {getFormattedDate()}
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .mobile-toggle {
            display: none !important;
          }
          .greeting {
            font-size: 18px !important;
          }
        }
      `}</style>
    </header>
  );
}
