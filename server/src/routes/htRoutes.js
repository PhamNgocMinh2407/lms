import { Router } from "express";

import {
    getHtDashboard,
    getHtPendingSubjectProposals,
    getHtReviewedSubjectProposals,
    getHtApprovedForPdtSubjectProposals,
    getHtAcademicReport
} from "../controllers/htController.js";

import { protectedRoute } from "../middlewares/authenticateMiddleware.js";
import { authorize } from "../middlewares/rbacMiddleware.js";

const router = Router();

router.get(
    "/dashboard",
    protectedRoute,
    authorize("ht"),
    getHtDashboard
);

router.get(
    "/pending-subject-proposals",
    protectedRoute,
    authorize("ht"),
    getHtPendingSubjectProposals
);

router.get(
    "/reviewed-subject-proposals",
    protectedRoute,
    authorize("ht"),
    getHtReviewedSubjectProposals
);

router.get(
    "/approved-for-pdt-subject-proposals",
    protectedRoute,
    authorize("ht"),
    getHtApprovedForPdtSubjectProposals
);

router.get(
    "/academic-report",
    protectedRoute,
    authorize("ht"),
    getHtAcademicReport
);
export default router;