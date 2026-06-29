import { Router } from "express";

import {
    getAllCourseSections,
    getCourseSectionById,
    createCourseSection,
    updateCourseSection,
    deleteCourseSection,
    lockCourseSection,
    unlockCourseSection,
    openCourseSectionRegistration,
    closeCourseSectionRegistration
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
router.patch(
    "/:id/open-registration",
    protectedRoute,
    authorize("admin", "pdt"),
    openCourseSectionRegistration
);

router.patch(
    "/:id/close-registration",
    protectedRoute,
    authorize("admin", "pdt"),
    closeCourseSectionRegistration
);
export default router;