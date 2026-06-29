import { Router } from "express";

import {
    getTeacherDashboard,
    getMyCourseSections,
    getMyStudents,
    getMyGrades,
    getMySubjectProposals,
    getMyAttendances,
    getTeacherSchedule
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
router.get(
    "/my-attendances",
    protectedRoute,
    authorize("teacher"),
    getMyAttendances
);
router.get(
    "/my-schedule",
    protectedRoute,
    authorize("teacher"),
    getTeacherSchedule
);
export default router;