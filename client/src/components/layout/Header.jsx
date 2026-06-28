import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function Header() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="dashboard-header">
      <div>
        <span className="dashboard-header-label">LMS Dashboard</span>
        <h1>Xin chào, {user?.name || user?.username || "Admin"}</h1>
      </div>

      <div className="dashboard-user-area">
        <span className="dashboard-role">{user?.role || "user"}</span>
        <button type="button" className="dashboard-logout" onClick={handleLogout}>
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
