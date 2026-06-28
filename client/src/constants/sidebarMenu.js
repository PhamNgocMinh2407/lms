import { ROLES } from "./roles";

export const SIDEBAR_MENU = {
  [ROLES.SUPER_ADMIN]: [
    { label: "Dashboard", path: "/dashboard/super-admin" },
    { label: "Quản lý tài khoản", path: "/dashboard/super-admin" },
    { label: "Báo cáo hệ thống", path: "/dashboard/super-admin" },
  ],

  [ROLES.ADMIN]: [
    { label: "Dashboard", path: "/dashboard/admin" },
    { label: "Quản lý tài khoản", path: "/dashboard/admin#users" },
    { label: "Tạo tài khoản", path: "/dashboard/admin#create-user" },
    { label: "Phân bổ vai trò", path: "/dashboard/admin#roles" },
  ],

  [ROLES.HR]: [
    { label: "Dashboard", path: "/dashboard/hr" },
    { label: "Nhân sự", path: "/dashboard/hr" },
    { label: "Tạo tài khoản", path: "/dashboard/hr" },
  ],

  [ROLES.HT]: [
    { label: "Dashboard", path: "/dashboard/ht" },
    { label: "Báo cáo tổng quan", path: "/dashboard/ht" },
  ],

  [ROLES.TRAINING]: [
    { label: "Dashboard", path: "/dashboard/pdt" },
    { label: "Môn học", path: "/dashboard/pdt" },
    { label: "Chương trình đào tạo", path: "/dashboard/pdt" },
  ],

  [ROLES.HEAD_DEPARTMENT]: [
    { label: "Dashboard", path: "/dashboard/tbm" },
    { label: "Bộ môn", path: "/dashboard/tbm" },
    { label: "Phân công giảng viên", path: "/dashboard/tbm" },
  ],

  [ROLES.LECTURER]: [
    { label: "Dashboard", path: "/dashboard/teacher" },
    { label: "Lớp giảng dạy", path: "/dashboard/teacher" },
    { label: "Bài kiểm tra", path: "/dashboard/teacher" },
  ],

  [ROLES.STUDENT]: [
    { label: "Trang chủ", path: "/dashboard/student" },
    { label: "Môn học", path: "/dashboard/student" },
    { label: "Lịch học", path: "/dashboard/student" },
  ],
};
