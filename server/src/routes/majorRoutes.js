import { Router } from "express";
import {
    getAllMajors,
    createMajor,
    getMajorById,
    updateMajor,
    deleteMajor,
    lockMajor,
    unlockMajor
} from "../controllers/majorController.js";

import { protectedRoute } from "../middlewares/authenticateMiddleware.js";
import { authorize } from "../middlewares/rbacMiddleware.js";

const router = Router();

router.get(
    "/",
    protectedRoute,
    authorize("admin", "pdt", "ht", "hr"),
    getAllMajors
);
router.get(
    "/:id",
    protectedRoute,
    authorize("admin", "pdt", "ht", "hr"),
    getMajorById
);
router.put(
    "/:id",
    protectedRoute,
    authorize("admin", "pdt"),
    updateMajor
);

router.delete(
    "/:id",
    protectedRoute,
    authorize("admin", "pdt"),
    deleteMajor
);

router.patch(
    "/:id/lock",
    protectedRoute,
    authorize("admin", "pdt"),
    lockMajor
);

router.patch(
    "/:id/unlock",
    protectedRoute,
    authorize("admin", "pdt"),
    unlockMajor
);

router.post(
    "/",
    protectedRoute,
    authorize("admin", "pdt"),
    createMajor
);

export default router;