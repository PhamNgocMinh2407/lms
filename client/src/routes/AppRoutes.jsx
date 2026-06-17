import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Auth/Login";
import ProtectedRoute from "./ProtectedRoute";

import DashboardLayout from "../components/layout/DashboardLayout";

import AdminDashboard from "../pages/dashboard/AdminDashboard";
import HrDashboard from "../pages/dashboard/HrDashboard";
import LecturerDashboard from "../pages/dashboard/LecturerDashboard";
import SuperAdminDashboard from "../pages/dashboard/SuperAdminDashboard";
import StudentDashboard from "../pages/dashboard/StudentDashboard";
import HeadDepartmentDashboard from "../pages/dashboard/HeadDepartmentDashboard";
import TrainingDashboard from "../pages/dashboard/TrainingDashboard";

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
          <Route path="student" element={<StudentDashboard />} />

          <Route path="admin" element={<AdminDashboard />} />

          <Route path="hr" element={<HrDashboard />} />

          <Route path="lecturer" element={<LecturerDashboard />} />

          <Route   path="head-department"  element={<HeadDepartmentDashboard />} />
          
          <Route path="training" element={<TrainingDashboard />}   />
 
          <Route  path="super-admin"  element={<SuperAdminDashboard />}  />         
        </Route>
      </Routes>
    </BrowserRouter>
  );
}