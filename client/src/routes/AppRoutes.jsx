import { BrowserRouter, Routes, Route } from "react-router-dom";

// Khớp chuẩn chữ 'pages' viết thường và 'Auth' viết hoa
import Login from "../pages/Auth/Login";
import ProtectedRoute from "./ProtectedRoute";

import DashboardLayout from "../components/layout/DashboardLayout";

// Khớp chuẩn xác tên các file dashboard hiện có trong thư mục của bạn
import AdminDashboard from "../pages/dashboard/AdminDashboard";
import HrDashboard from "../pages/dashboard/HrDashboard";
import LecturerDashboard from "../pages/dashboard/LecturerDashboard"; 
import StudentDashboard from "../pages/dashboard/StudentDashboard";
import HeadDepartmentDashboard from "../pages/dashboard/HeadDepartmentDashboard"; 
import TrainingDashboard from "../pages/dashboard/TrainingDashboard"; 
import SuperAdminDashboard from "../pages/dashboard/SuperAdminDashboard";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Định nghĩa các Route con khớp với file hằng số DASHBOARD_ROUTES */}
          <Route path="student" element={<StudentDashboard />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="hr" element={<HrDashboard />} />
          <Route path="teacher" element={<LecturerDashboard />} /> 
          <Route path="tbm" element={<HeadDepartmentDashboard />} />
          <Route path="pdt" element={<TrainingDashboard />} />
          
          {/* Tạm thời hướng role 'ht' (Hiệu trưởng) dùng chung trang Admin hoặc tùy bạn xử lý sau vì chưa có file */}
          <Route path="ht" element={<AdminDashboard />} /> 

          <Route path="super-admin" element={<SuperAdminDashboard />} />         
        </Route>
      </Routes>
    </BrowserRouter>
  );
}