import { Router } from "express";

import {
    getPdtDashboard,
    getPdtApprovedSubjectProposals,
    getPdtPublishedSubjectProposals,
    getPdtCourseSections,
    getPdtEnrollments,
    getPdtGrades,
    getPdtStudentTranscript
} from "../controllers/pdtController.js";

import { protectedRoute } from "../middlewares/authenticateMiddleware.js";
import { authorize } from "../middlewares/rbacMiddleware.js";

const router = Router();

router.get(
    "/dashboard",
    protectedRoute,
    authorize("pdt"),
    getPdtDashboard
);

router.get(
    "/approved-subject-proposals",
    protectedRoute,
    authorize("pdt"),
    getPdtApprovedSubjectProposals
);

router.get(
    "/published-subject-proposals",
    protectedRoute,
    authorize("pdt"),
    getPdtPublishedSubjectProposals
);

router.get(
    "/course-sections",
    protectedRoute,
    authorize("pdt"),
    getPdtCourseSections
);

router.get(
    "/enrollments",
    protectedRoute,
    authorize("pdt"),
    getPdtEnrollments
);
router.get(
    "/grades",
    protectedRoute,
    authorize("pdt"),
    getPdtGrades
);

router.get(
    "/student-transcript/:id",
    protectedRoute,
    authorize("pdt"),
    getPdtStudentTranscript
);
export default router;