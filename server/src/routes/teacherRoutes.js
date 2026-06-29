import { Router } from "express";

import {
    getTeacherDashboard,
    getMyCourseSections,
    getMyStudents,
    getMyGrades,
    getMySubjectProposals
} from "../controllers/teacherController.js";

import { protectedRoute } from "../middlewares/authenticateMiddleware.js";
import { authorize } from "../middlewares/rbacMiddleware.js";

const router = Router();

router.get(
    "/dashboard",
    protectedRoute,
    authorize("teacher"),
    getTeacherDashboard
);

router.get(
    "/my-course-sections",
    protectedRoute,
    authorize("teacher"),
    getMyCourseSections
);

router.get(
    "/my-students",
    protectedRoute,
    authorize("teacher"),
    getMyStudents
);
router.get(
    "/my-grades",
    protectedRoute,
    authorize("teacher"),
    getMyGrades
);
router.get(
    "/my-subject-proposals",
    protectedRoute,
    authorize("teacher"),
    getMySubjectProposals
);
export default router;