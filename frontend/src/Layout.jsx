import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Layout = ({ children, title = "Dashboard" }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const role = localStorage.getItem("role") || "";
  const name = localStorage.getItem("name") || "User";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const patientLinks = [
    { to: "/dashboard", label: "Dashboard", icon: "📊" },
    { to: "/doctors", label: "Doctors", icon: "👨‍⚕️" },
    { to: "/book-appointment", label: "Book Appointment", icon: "📅" },
    { to: "/my-appointments", label: "My Appointments", icon: "📋" },
    { to: "/token-status", label: "Token Status", icon: "🎫" },
    { to: "/live-queue", label: "Live Queue", icon: "⏱️" }
  ];

  const doctorLinks = [
    { to: "/dashboard", label: "Dashboard", icon: "📊" },
    { to: "/doctor-queue", label: "Today's Queue", icon: "🩺" },
    { to: "/doctor/call-next", label: "Call Next Patient", icon: "📢" }
  ];

  const adminLinks = [
    { to: "/dashboard", label: "Dashboard", icon: "📊" },
    { to: "/manage-patients", label: "Manage Patients", icon: "👥" },
    { to: "/manage-doctors", label: "Manage Doctors", icon: "👨‍⚕️" },
    { to: "/manage-departments", label: "Departments", icon: "🏥" },
    { to: "/book-appointment", label: "Book Appointment", icon: "📅" },
    { to: "/manage-appointments", label: "Appointments", icon: "📑" },
    { to: "/manage-schedules", label: "Manage Schedules", icon: "🗓️" },
    { to: "/queue-management", label: "Queue Management", icon: "🚦" }
  ];

  let currentLinks = [];
  if (role === "PATIENT") {
    currentLinks = patientLinks;
  } else if (role === "DOCTOR") {
    currentLinks = doctorLinks;
  } else if (role === "ADMIN") {
    currentLinks = adminLinks;
  }

  return (
    <div className="app-layout">
      {/* Fixed Desktop Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo-icon">➕</div>
          <div className="sidebar-brand-text">
            <h2>ApexCare</h2>
            <p>Queue & Token System</p>
          </div>
        </div>

        <div className="sidebar-menu">
          <div className="sidebar-section-title">Navigation</div>
          {currentLinks.map((item) => {
            const isActive = location.pathname === item.to || (item.to !== "/dashboard" && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`sidebar-link ${isActive ? "active" : ""}`}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{name}</div>
            <div className="sidebar-user-role">{role}</div>
          </div>
          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={handleLogout}
            title="Logout"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="main-wrapper">
        <header className="top-header">
          <div className="header-left">
            <h1>{title}</h1>
            <span className="header-subtitle">ApexCare Hospital Management Portal</span>
          </div>

          <div className="header-right">
            <span className="header-badge">{role}</span>
            <div className="notification-bell" title="Notifications">
              🔔
              <span className="notification-dot"></span>
            </div>
            <div className="header-avatar" title={name}>
              {name ? name.charAt(0).toUpperCase() : "U"}
            </div>
          </div>
        </header>

        <main className="main-content">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav">
        <Link
          to="/dashboard"
          className={`bottom-nav-item ${location.pathname === "/dashboard" ? "active" : ""}`}
        >
          <span className="bottom-nav-icon">📊</span>
          <span>Home</span>
        </Link>

        {role === "PATIENT" && (
          <>
            <Link
              to="/doctors"
              className={`bottom-nav-item ${location.pathname === "/doctors" ? "active" : ""}`}
            >
              <span className="bottom-nav-icon">👨‍⚕️</span>
              <span>Doctors</span>
            </Link>
            <Link
              to="/my-appointments"
              className={`bottom-nav-item ${location.pathname === "/my-appointments" ? "active" : ""}`}
            >
              <span className="bottom-nav-icon">📋</span>
              <span>Bookings</span>
            </Link>
            <Link
              to="/token-status"
              className={`bottom-nav-item ${location.pathname === "/token-status" ? "active" : ""}`}
            >
              <span className="bottom-nav-icon">🎫</span>
              <span>Token</span>
            </Link>
          </>
        )}

        {role === "DOCTOR" && (
          <Link
            to="/doctor-queue"
            className={`bottom-nav-item ${location.pathname === "/doctor-queue" ? "active" : ""}`}
          >
            <span className="bottom-nav-icon">🩺</span>
            <span>Queue</span>
          </Link>
        )}

        {role === "ADMIN" && (
          <>
            <Link
              to="/manage-doctors"
              className={`bottom-nav-item ${location.pathname === "/manage-doctors" ? "active" : ""}`}
            >
              <span className="bottom-nav-icon">👨‍⚕️</span>
              <span>Doctors</span>
            </Link>
            <Link
              to="/queue-management"
              className={`bottom-nav-item ${location.pathname === "/queue-management" ? "active" : ""}`}
            >
              <span className="bottom-nav-icon">🚦</span>
              <span>Queue</span>
            </Link>
          </>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="bottom-nav-item"
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          <span className="bottom-nav-icon">🚪</span>
          <span>Exit</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
