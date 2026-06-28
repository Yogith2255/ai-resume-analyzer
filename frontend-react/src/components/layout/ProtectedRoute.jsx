import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "var(--bg-main)",
        color: "var(--text-main)",
        gap: "16px"
      }}>
        <div style={{
          width: "48px",
          height: "48px",
          border: "4px solid rgba(99, 102, 241, 0.1)",
          borderTopColor: "var(--primary)",
          borderRadius: "50%",
          animation: "fadeIn 0.6s infinite linear, rotate 1s infinite linear"
        }} />
        <p style={{
          fontSize: "15px",
          color: "var(--text-muted)",
          fontWeight: "500",
          letterSpacing: "0.5px"
        }}>Syncing credentials...</p>
        <style>{`
          @keyframes rotate {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}
