import { Router } from "express";

import {
    getStudentDashboard,
    getStudentCourseSections,
    getStudentGrades,
    getStudentTranscript,
    getAvailableCourseSections
} from "../controllers/studentController.js";

import { protectedRoute } from "../middlewares/authenticateMiddleware.js";
import { authorize } from "../middlewares/rbacMiddleware.js";

const router = Router();

router.get(
    "/dashboard",
    protectedRoute,
    authorize("student"),
    getStudentDashboard
);

router.get(
    "/my-course-sections",
    protectedRoute,
    authorize("student"),
    getStudentCourseSections
);

router.get(
    "/my-grades",
    protectedRoute,
    authorize("student"),
    getStudentGrades
);

router.get(
    "/my-transcript",
    protectedRoute,
    authorize("student"),
    getStudentTranscript
);

router.get(
    "/available-course-sections",
    protectedRoute,
    authorize("student"),
    getAvailableCourseSections
);

export default router;