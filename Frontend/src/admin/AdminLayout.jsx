import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  Users,
  FilePlus,
  Folder,
  Bell,
  Home,
  FileText,
  ChevronRight,
  ChevronLeft,
  NotebookPen,
} from "lucide-react";
import Header from "../components/Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AdminLayout.css";

const AdminLayout = () => {
  const [open, setOpen] = useState(false);

  const navItems = [
    { to: "/admin", label: "Dashboard", icon: Home, end: true },
    { to: "/admin/submissions", label: "Submissions", icon: FileText },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/labs", label: "Labs", icon: FilePlus },
    { to: "/admin/challenges", label: "Challenges", icon: Folder },
    { to: "/admin/blogs", label: "Blogs", icon: NotebookPen },
    { to: "/admin/communication", label: "Communication", icon: Bell },
    { to: "/admin/contact-queries", label: "User Contact", icon: FileText },
    { to: "/admin/manage-faqs", label: "User FAQs", icon: FileText },
  ];

  return (
    <>
      <Header />

      <ToastContainer
        position="top-right"
        autoClose={2500}
        theme="dark"
        style={{ zIndex: 2000 }}
      />

      <div className="admin-layout-shell">
        <aside className={`admin-layout-sidebar ${open ? "open" : ""}`}>
          <h2 className="admin-layout-title">Admin Panel</h2>

          <nav className="admin-layout-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `admin-layout-link ${isActive ? "active" : ""}`
                  }
                >
                  <Icon size={17} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <button
          onClick={() => setOpen((prev) => !prev)}
          className="admin-layout-toggle"
          aria-label="Toggle admin sidebar"
        >
          {open ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>

        {open ? <div className="admin-layout-overlay" onClick={() => setOpen(false)} /> : null}

        <main className="admin-layout-content">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default AdminLayout;
