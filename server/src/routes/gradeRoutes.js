import { Router } from "express";

import {
    createGrade,
    getAllGrades,
    getGradeById,
    updateGrade,
    deleteGrade,
    publishGrade,
    lockGrade,
    unlockGrade,
    getMyGrades,
    getGradesByStudentId,
    getGradesByCourseSectionId
} from "../controllers/gradeController.js";

import { protectedRoute } from "../middlewares/authenticateMiddleware.js";
import { authorize } from "../middlewares/rbacMiddleware.js";

const router = Router();

router.get(
    "/",
    protectedRoute,
    authorize("admin", "pdt", "ht", "tbm", "teacher"),
    getAllGrades
);
router.get(
    "/my-grades",
    protectedRoute,
    authorize("student"),
    getMyGrades
);
router.post(
    "/",
    protectedRoute,
    authorize("admin", "pdt", "teacher"),
    createGrade
);
router.get(
    "/my-grades",
    protectedRoute,
    authorize("student"),
    getMyGrades
);

router.get(
    "/student/:id",
    protectedRoute,
    authorize("admin", "pdt", "ht", "tbm"),
    getGradesByStudentId
);

router.get(
    "/course-section/:id",
    protectedRoute,
    authorize("admin", "pdt", "ht", "tbm", "teacher"),
    getGradesByCourseSectionId
);

router.get(
    "/:id",
    protectedRoute,
    authorize("admin", "pdt", "ht", "tbm", "teacher", "student"),
    getGradeById
);
router.get(
    "/:id",
    protectedRoute,
    authorize("admin", "pdt", "ht", "tbm", "teacher", "student"),
    getGradeById
);

router.put(
    "/:id",
    protectedRoute,
    authorize("admin", "pdt", "teacher"),
    updateGrade
);

router.delete(
    "/:id",
    protectedRoute,
    authorize("admin", "pdt"),
    deleteGrade
);

router.patch(
    "/:id/publish",
    protectedRoute,
    authorize("admin", "pdt", "teacher"),
    publishGrade
);

router.patch(
    "/:id/lock",
    protectedRoute,
    authorize("admin", "pdt"),
    lockGrade
);
router.patch(
    "/:id/unlock",
    protectedRoute,
    authorize("admin", "pdt"),
    unlockGrade
);

export default router;