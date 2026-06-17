import { useAuthStore } from "../../store/authStore";
import { ROLES } from "../../constants/roles";
import { useNavigate } from "react-router-dom";
import { DASHBOARD_ROUTES } from "../../constants/dashboardRoutes";

export default function Login() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = () => {
   const user =  {
    id: 1,
    name: "Nguyễn Văn A",
    role: ROLES.ADMIN,
};
login(user);

navigate(DASHBOARD_ROUTES[user.role])
};
    

  return (
    <div>
      <h1>Đăng nhập</h1>

      <button onClick={handleLogin}>
        Đăng nhập thử
      </button>
    </div>
  );
}