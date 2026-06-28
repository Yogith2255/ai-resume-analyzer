import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      backgroundColor: "var(--bg-main)"
    }}>
      {/* Sidebar navigation panel */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main dashboard content panel */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        paddingLeft: "0",
        transition: "padding var(--transition-normal)"
      }} className="main-content-layout">
        <Header toggleSidebar={toggleSidebar} />
        
        <main style={{
          flex: 1,
          padding: "24px",
          overflowY: "auto"
        }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
            {children}
          </div>
        </main>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .main-content-layout {
            padding-left: 260px !important;
          }
        }
      `}</style>
    </div>
  );
}
