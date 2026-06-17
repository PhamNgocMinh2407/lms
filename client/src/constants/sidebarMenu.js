import { ROLES } from "./roles";

export const SIDEBAR_MENU = {
  [ROLES.SUPER_ADMIN]: [
    {
      label: "Dashboard",
      path: "/dashboard/super-admin",
    },
    {
      label: "Quản lý tài khoản",
      path: "/users",
    },
    {
      label: "Phân quyền",
      path: "/permissions",
    },
    {
      label: "Quản lý môn học",
      path: "/subjects",
    },
    {
      label: "Chương trình đào tạo",
      path: "/curriculums",
    },
    {
      label: "Quản lý lớp học",
      path: "/classes",
    },
    {
      label: "Quản lý giảng viên",
      path: "/lecturers",
    },
    {
      label: "Quản lý sinh viên",
      path: "/students",
    },
    {
      label: "Quản lý bài học",
      path: "/lessons",
    },
    {
      label: "Quản lý kiểm tra",
      path: "/exams",
    },
    {
      label: "Thống kê báo cáo",
      path: "/reports",
    },
    {
      label: "Nhật ký hệ thống",
      path: "/system-logs",
    },
  ],

  [ROLES.ADMIN]: [
    {
      label: "Dashboard",
      path: "/dashboard/admin",
    },
    {
      label: "Quản lý tài khoản",
      path: "/users",
    },
    {
      label: "Phân quyền",
      path: "/permissions",
    },
    {
      label: "Cấu hình hệ thống",
      path: "/settings",
    },
    {
      label: "Backup / Restore",
      path: "/backup",
    },
  ],

  [ROLES.HR]: [
    {
      label: "Dashboard",
      path: "/dashboard/hr",
    },
    {
      label: "Quản lý nhân sự",
      path: "/employees",
    },
    {
      label: "Quản lý sinh viên",
      path: "/students",
    },
    {
      label: "Tạo tài khoản",
      path: "/accounts/create",
    },
  ],

  [ROLES.TRAINING]: [
    {
      label: "Dashboard",
      path: "/dashboard/training",
    },
    {
      label: "Quản lý môn học",
      path: "/subjects",
    },
    {
      label: "Chương trình đào tạo",
      path: "/curriculums",
    },
    {
      label: "Quản lý lớp học",
      path: "/classes",
    },
    {
      label: "Đăng ký học phần",
      path: "/enrollments",
    },
    {
      label: "Báo cáo đào tạo",
      path: "/training-reports",
    },
  ],

  [ROLES.HEAD_DEPARTMENT]: [
    {
      label: "Dashboard",
      path: "/dashboard/head-department",
    },
    {
      label: "Đề xuất môn học",
      path: "/subject-proposals",
    },
    {
      label: "Đề xuất lớp học",
      path: "/class-proposals",
    },
    {
      label: "Phân công giảng viên",
      path: "/lecturer-assignments",
    },
    {
      label: "Theo dõi bộ môn",
      path: "/department-overview",
    },
  ],

  [ROLES.LECTURER]: [
    {
      label: "Dashboard",
      path: "/dashboard/lecturer",
    },
    {
      label: "Lớp đang giảng dạy",
      path: "/my-classes",
    },
    {
      label: "Bài học",
      path: "/lessons",
    },
    {
      label: "Bài kiểm tra",
      path: "/exams",
    },
    {
      label: "Điểm số",
      path: "/scores",
    },
  ],

  [ROLES.STUDENT]: [
    {
      label: "Trang chủ",
      path: "/dashboard/student",
    },
    {
      label: "Môn học",
      path: "/subjects",
    },
    {
      label: "Đăng ký học phần",
      path: "/enrollments",
    },
    {
      label: "Bài học",
      path: "/lessons",
    },
    {
      label: "Bài kiểm tra",
      path: "/exams",
    },
    {
      label: "Điểm số",
      path: "/scores",
    },
    {
      label: "Lịch học",
      path: "/schedule",
    },
    {
      label: "Thông báo",
      path: "/notifications",
    },
  ],
};