import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { SIDEBAR_MENU } from "../../constants/sidebarMenu";

export default function Sidebar() {
  const user = useAuthStore((state) => state.user);

  const menus = SIDEBAR_MENU[user?.role] || [];

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white">
      <div className="p-4 text-xl font-bold">
        Viet My LMS
      </div>

      <nav>
        {menus.map((menu) => (
          <Link
            key={menu.path}
            to={menu.path}
            className="block px-4 py-3 hover:bg-slate-700"
          >
            {menu.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}