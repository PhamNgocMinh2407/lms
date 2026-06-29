import { Router } from "express";

import {
    takeAttendance,
    getCourseSectionAttendance,
    getMyAttendance
} from "../controllers/attendanceController.js";

import { protectedRoute } from "../middlewares/authenticateMiddleware.js";
import { authorize } from "../middlewares/rbacMiddleware.js";

const router = Router();

router.post(
    "/take",
    protectedRoute,
    authorize("teacher", "admin"),
    takeAttendance
);

router.get(
    "/course-section/:id",
    protectedRoute,
    authorize("teacher", "pdt", "ht", "tbm", "admin"),
    getCourseSectionAttendance
);

router.get(
    "/my-attendance",
    protectedRoute,
    authorize("student"),
    getMyAttendance
);

export default router;