import { Router } from "express";

import {
    getTbmDashboard,
    getTbmPendingProposals,
    getTbmReviewedProposals,
    getTbmSentToHtProposals
} from "../controllers/tbmController.js";

import { protectedRoute } from "../middlewares/authenticateMiddleware.js";
import { authorize } from "../middlewares/rbacMiddleware.js";

const router = Router();

router.get(
    "/dashboard",
    protectedRoute,
    authorize("tbm"),
    getTbmDashboard
);

router.get(
    "/pending-subject-proposals",
    protectedRoute,
    authorize("tbm"),
    getTbmPendingProposals
);

router.get(
    "/reviewed-subject-proposals",
    protectedRoute,
    authorize("tbm"),
    getTbmReviewedProposals
);
router.get(
    "/sent-to-ht-subject-proposals",
    protectedRoute,
    authorize("tbm"),
    getTbmSentToHtProposals
);

export default router;