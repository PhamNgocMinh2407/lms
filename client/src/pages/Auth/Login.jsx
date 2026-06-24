import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { loginUser } from "../../store/api"; 
import { DASHBOARD_ROUTES } from "../../constants/dashboardRoutes";

export default function Login() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  // Tạo các state lưu thông tin nhập từ form
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Gọi API thực tế xuống Backend (kết nối MongoDB Atlas)
      const data = await loginUser(username, password);

      // Lưu accessToken vào localStorage (để dùng cho các request cần xác thực sau này)
      localStorage.setItem("accessToken", data.accessToken);

      // 2. Tạo object user từ dữ liệu thật nhận từ backend trả về
      // (Giả sử backend trả về data.role dạng 'admin', 'student' trùng với key của ROLES)
      const loggedInUser = {
        id: data.userId || "real-id", 
        name: data.message.split(" ") || username, // Lấy tên hiển thị từ message hoặc username
        role: data.role, // Lấy role thực tế từ database
      };

      // 3. Cập nhật state vào Zustand Store của bạn
      login(loggedInUser);

      // 4. Điều hướng theo hằng số DASHBOARD_ROUTES có sẵn của bạn
      if (DASHBOARD_ROUTES[loggedInUser.role]) {
        navigate(DASHBOARD_ROUTES[loggedInUser.role]);
      } else {
        // Dự phòng nếu role không khớp với cấu hình hệ thống tuyến đường
        navigate("/dashboard/student");
      }

    } catch (err) {
      // Hiển thị lỗi từ backend (ví dụ: "Tên đăng nhập hoặc mật khẩu không đúng")
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>ĐĂNG NHẬP HỆ THỐNG</h2>

      {error && <div style={styles.errorBox}>{error}</div>}

      <form onSubmit={handleLogin}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Tên đăng nhập:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={styles.input}
            placeholder="Nhập tên đăng nhập (ví dụ: admin)"
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Mật khẩu:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
            placeholder="Nhập mật khẩu"
          />
        </div>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Đang xác thực..." : "Đăng Nhập"}
        </button>
      </form>
    </div>
  );
}

// CSS Inline cơ bản giúp dễ test giao diện
const styles = {
  container: { maxWidth: "400px", margin: "100px auto", padding: "30px", border: "1px solid #e0e0e0", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontFamily: "Arial, sans-serif" },
  title: { textAlign: "center", marginBottom: "25px", color: "#333", fontWeight: "bold" },
  errorBox: { color: "#721c24", backgroundColor: "#f8d7da", border: "1px solid #f5c6cb", padding: "10px", borderRadius: "6px", marginBottom: "15px", fontSize: "14px" },
  inputGroup: { marginBottom: "20px" },
  label: { display: "block", marginBottom: "6px", fontWeight: "bold", color: "#555" },
  input: { width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" },
  button: { width: "100%", padding: "12px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "6px", fontSize: "16px", cursor: "pointer", fontWeight: "bold" }
};