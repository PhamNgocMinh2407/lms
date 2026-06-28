import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { SIDEBAR_MENU } from "../../constants/sidebarMenu";

export default function Sidebar() {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const menus = SIDEBAR_MENU[user?.role] || [];
  const currentPath = `${location.pathname}${location.hash}`;

  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-brand">
        <span>VM</span>
        <div>
          <strong>Viet My LMS</strong>
          <small>Admin Portal</small>
        </div>
      </div>

      <nav className="dashboard-nav" aria-label="Dashboard navigation">
        {menus.map((menu) => {
          const isActive =
            currentPath === menu.path ||
            (!location.hash && !menu.path.includes("#") && location.pathname === menu.path);

          return (
            <Link
              key={`${menu.path}-${menu.label}`}
              to={menu.path}
              className={`dashboard-nav-link ${isActive ? "is-active" : ""}`}
            >
              {menu.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
