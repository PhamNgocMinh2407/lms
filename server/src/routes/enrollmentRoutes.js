import { Router } from "express";
import {
    createEnrollment,
    getAllEnrollments,
    getEnrollmentById,
    getMyEnrollments,
    cancelEnrollment,
    getCourseSectionStudents,
    completeEnrollment
} from "../controllers/enrollmentController.js";

import { protectedRoute } from "../middlewares/authenticateMiddleware.js";
import { authorize } from "../middlewares/rbacMiddleware.js";

const router = Router();

router.post(
    "/",
    protectedRoute,
    authorize("admin", "pdt", "student"),
    createEnrollment
);
router.get(
    "/",
    protectedRoute,
    authorize("admin", "pdt", "ht"),
    getAllEnrollments
);
router.get(
    "/my-enrollments",
    protectedRoute,
    authorize("student"),
    getMyEnrollments
);
router.patch(
    "/:id/cancel",
    protectedRoute,
    authorize("student"),
    cancelEnrollment
);
router.get(
    "/:id/students",
    protectedRoute,
    authorize("admin", "pdt", "ht", "tbm", "teacher"),
    getCourseSectionStudents
);
router.get(
    "/:id",
    protectedRoute,
    authorize("admin", "pdt", "ht"),
    getEnrollmentById
);
router.patch(
    "/:id/complete",
    protectedRoute,
    authorize("admin", "pdt"),
    completeEnrollment
);

export default router;