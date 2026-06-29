import { Router } from "express";

import {
    createSubjectProposal,
    getMySubjectProposals,
    getPendingTbmProposals,
    tbmApproveSubjectProposal,
    tbmRejectSubjectProposal,
    getPendingHtProposals,
    htApproveSubjectProposal,
    htRejectSubjectProposal,
    getApprovedForPdtProposals,
    publishSubjectProposal
} from "../controllers/subjectProposalController.js";

import { protectedRoute } from "../middlewares/authenticateMiddleware.js";
import { authorize } from "../middlewares/rbacMiddleware.js";

const router = Router();

router.post(
    "/",
    protectedRoute,
    authorize("teacher"),
    createSubjectProposal
);

router.get(
    "/my-proposals",
    protectedRoute,
    authorize("teacher"),
    getMySubjectProposals
);

router.get(
    "/pending-tbm",
    protectedRoute,
    authorize("tbm", "admin"),
    getPendingTbmProposals
);

router.patch(
    "/:id/tbm-approve",
    protectedRoute,
    authorize("tbm", "admin"),
    tbmApproveSubjectProposal
);

router.patch(
    "/:id/tbm-reject",
    protectedRoute,
    authorize("tbm", "admin"),
    tbmRejectSubjectProposal
);
router.get(
    "/pending-ht",
    protectedRoute,
    authorize("ht", "admin"),
    getPendingHtProposals
);

router.patch(
    "/:id/ht-approve",
    protectedRoute,
    authorize("ht", "admin"),
    htApproveSubjectProposal
);

router.patch(
    "/:id/ht-reject",
    protectedRoute,
    authorize("ht", "admin"),
    htRejectSubjectProposal
);

router.get(
    "/approved-for-pdt",
    protectedRoute,
    authorize("pdt", "admin"),
    getApprovedForPdtProposals
);

router.patch(
    "/:id/publish",
    protectedRoute,
    authorize("pdt", "admin"),
    publishSubjectProposal
);
export default router;