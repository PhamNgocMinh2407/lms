import { Router } from "express";

import {
    getAllSubjects,
    getSubjectById,
    createSubject,
    updateSubject,
    deleteSubject,
    lockSubject,
    unlockSubject
} from "../controllers/subjectController.js";

import { protectedRoute } from "../middlewares/authenticateMiddleware.js";
import { authorize } from "../middlewares/rbacMiddleware.js";

const router = Router();

router.get(
    "/",
    protectedRoute,
    authorize("admin", "pdt", "ht", "tbm", "teacher"),
    getAllSubjects
);

router.get(
    "/:id",
    protectedRoute,
    authorize("admin", "pdt", "ht", "tbm", "teacher"),
    getSubjectById
);

router.post(
    "/",
    protectedRoute,
    authorize("admin", "pdt", "tbm"),
    createSubject
);

router.put(
    "/:id",
    protectedRoute,
    authorize("admin", "pdt", "tbm"),
    updateSubject
);

router.delete(
    "/:id",
    protectedRoute,
    authorize("admin", "pdt"),
    deleteSubject
);

router.patch(
    "/:id/lock",
    protectedRoute,
    authorize("admin", "pdt"),
    lockSubject
);

router.patch(
    "/:id/unlock",
    protectedRoute,
    authorize("admin", "pdt"),
    unlockSubject
);

export default router;