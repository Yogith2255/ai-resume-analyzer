import { NavLink, useNavigate } from "react-router-dom";
import { FiGrid, FiMessageSquare, FiUser, FiLogOut, FiAward } from "react-icons/fi";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Successfully logged out");
      navigate("/auth");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          onClick={toggleSidebar}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 990,
          }}
        />
      )}

      <aside style={{
        position: "fixed",
        top: 0,
        bottom: 0,
        left: 0,
        width: "260px",
        backgroundColor: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border-color)",
        display: "flex",
        flexDirection: "column",
        zIndex: 1000,
        transition: "transform var(--transition-normal)",
        transform: isOpen ? "translateX(0)" : "translateX(-100%)",
      }} className="sidebar-element">
        {/* Logo Section */}
        <div style={{
          padding: "24px 30px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          borderBottom: "1px solid var(--border-color)"
        }}>
          <span style={{
            fontSize: "22px",
            color: "var(--primary)",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center"
          }}>✦</span>
          <h2 style={{
            fontSize: "18px",
            fontWeight: 800,
            letterSpacing: "0.5px",
            background: "linear-gradient(135deg, #ffffff 40%, #a5b4fc 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>CareerLens</h2>
        </div>

        {/* Navigation Links */}
        <nav style={{
          flex: 1,
          padding: "30px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "8px"
        }}>
          <NavLink 
            to="/dashboard" 
            onClick={toggleSidebar}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          >
            <FiGrid size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink 
            to="/resume-coach" 
            onClick={toggleSidebar}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          >
            <FiMessageSquare size={18} />
            <span>Resume Coach</span>
          </NavLink>

          <NavLink 
            to="/interview-prep" 
            onClick={toggleSidebar}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          >
            <FiAward size={18} />
            <span>AI Interview Prep</span>
          </NavLink>

          <NavLink 
            to="/profile" 
            onClick={toggleSidebar}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          >
            <FiUser size={18} />
            <span>Profile & Resume</span>
          </NavLink>
        </nav>

        {/* User Card & Logout */}
        <div style={{
          padding: "16px",
          borderTop: "1px solid var(--border-color)",
          backgroundColor: "rgba(255, 255, 255, 0.01)"
        }}>
          {user && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "16px",
              padding: "8px"
            }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                color: "#ffffff",
                fontSize: "16px"
              }}>
                {user.name ? user.name[0].toUpperCase() : "U"}
              </div>
              <div style={{ overflow: "hidden" }}>
                <div style={{
                  fontWeight: "600",
                  fontSize: "14px",
                  color: "var(--text-main)",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden"
                }}>{user.name}</div>
                <div style={{
                  fontSize: "12px",
                  color: "var(--text-dark)",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden"
                }}>{user.email}</div>
              </div>
            </div>
          )}

          <button 
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid var(--border-color)",
              backgroundColor: "rgba(239, 68, 68, 0.05)",
              color: "var(--error)",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all var(--transition-fast)"
            }}
            className="btn-logout"
          >
            <FiLogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <style>{`
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 10px;
          color: var(--text-muted);
          text-decoration: none;
          font-weight: 500;
          font-size: 15px;
          transition: all var(--transition-fast);
        }
        .sidebar-link:hover {
          color: var(--text-main);
          background-color: rgba(255, 255, 255, 0.03);
        }
        .sidebar-link.active {
          color: #ffffff;
          background-color: var(--primary);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
        .btn-logout:hover {
          background-color: rgba(239, 68, 68, 0.15) !important;
          border-color: rgba(239, 68, 68, 0.3) !important;
        }
        @media (min-width: 1024px) {
          .sidebar-element {
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </>
  );
}
