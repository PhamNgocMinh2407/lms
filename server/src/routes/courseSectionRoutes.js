import { Router } from "express";

import {
    getAllCourseSections,
    getCourseSectionById,
    createCourseSection,
    updateCourseSection,
    deleteCourseSection,
    lockCourseSection,
    unlockCourseSection
} from "../controllers/courseSectionController.js";

import { protectedRoute } from "../middlewares/authenticateMiddleware.js";
import { authorize } from "../middlewares/rbacMiddleware.js";

const router = Router();

router.get(
    "/",
    protectedRoute,
    authorize("admin", "pdt", "ht", "tbm", "teacher", "student"),
    getAllCourseSections
);

router.get(
    "/:id",
    protectedRoute,
    authorize("admin", "pdt", "ht", "tbm", "teacher", "student"),
    getCourseSectionById
);

router.post(
    "/",
    protectedRoute,
    authorize("admin", "pdt", "tbm"),
    createCourseSection
);

router.put(
    "/:id",
    protectedRoute,
    authorize("admin", "pdt", "tbm"),
    updateCourseSection
);

router.delete(
    "/:id",
    protectedRoute,
    authorize("admin", "pdt"),
    deleteCourseSection
);

router.patch(
    "/:id/lock",
    protectedRoute,
    authorize("admin", "pdt"),
    lockCourseSection
);

router.patch(
    "/:id/unlock",
    protectedRoute,
    authorize("admin", "pdt"),
    unlockCourseSection
);

export default router;