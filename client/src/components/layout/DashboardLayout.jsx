import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "./DashboardLayout.css";

export default function DashboardLayout() {
  return (
    <div className="dashboard-shell">
      <Sidebar />

      <div className="dashboard-content">
        <Header />

        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
