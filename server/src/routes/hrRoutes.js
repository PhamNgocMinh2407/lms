import { Router } from "express";

import {
    getAllStaffs,
    getHRDashboard,
    getHRStudents,
    createHRUser,
    updateHRUser
} from "../controllers/hrController.js";

import { protectedRoute } from "../middlewares/authenticateMiddleware.js";
import { authorize } from "../middlewares/rbacMiddleware.js";

const router = Router();

router.get(
    "/dashboard",
    protectedRoute,
    authorize("hr", "admin"),
    getHRDashboard
);

router.get(
    "/staffs",
    protectedRoute,
    authorize("hr", "admin"),
    getAllStaffs
);

router.get(
    "/students",
    protectedRoute,
    authorize("hr", "admin"),
    getHRStudents
);

router.post(
    "/users",
    protectedRoute,
    authorize("hr", "admin"),
    createHRUser
);

router.put(
    "/users/:id",
    protectedRoute,
    authorize("hr", "admin"),
    updateHRUser
);

export default router;