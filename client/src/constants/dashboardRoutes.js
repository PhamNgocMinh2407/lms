import { ROLES } from "./roles";

export const DASHBOARD_ROUTES = {
  [ROLES.SUPER_ADMIN]: "/dashboard/super-admin",
  [ROLES.ADMIN]: "/dashboard/admin",
  [ROLES.HR]: "/dashboard/hr",
  [ROLES.TRAINING]: "/dashboard/training",
  [ROLES.HEAD_DEPARTMENT]: "/dashboard/head-department",
  [ROLES.LECTURER]: "/dashboard/lecturer",
  [ROLES.STUDENT]: "/dashboard/student",
};