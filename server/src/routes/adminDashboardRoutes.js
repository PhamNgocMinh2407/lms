import { Router } from "express";

import {
    getAdminDashboard,
    getSystemOverview
} from "../controllers/adminDashboardController.js";

import { protectedRoute } from "../middlewares/authenticateMiddleware.js";
import { authorize } from "../middlewares/rbacMiddleware.js";

const router = Router();

router.get(
    "/dashboard",
    protectedRoute,
    authorize("admin"),
    getAdminDashboard
);

router.get(
    "/system-overview",
    protectedRoute,
    authorize("admin"),
    getSystemOverview
);

export default router;