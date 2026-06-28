import { Router } from "express";

import {
    getAllSemesters,
    getSemesterById,
    createSemester,
    updateSemester,
    deleteSemester
} from "../controllers/semesterController.js";

import { protectedRoute } from "../middlewares/authenticateMiddleware.js";
import { authorize } from "../middlewares/rbacMiddleware.js";

const router = Router();

router.get("/", protectedRoute, authorize("admin", "pdt", "ht"), getAllSemesters);

router.get("/:id", protectedRoute, authorize("admin", "pdt", "ht"), getSemesterById);

router.post("/", protectedRoute, authorize("admin", "pdt"), createSemester);

router.put("/:id", protectedRoute, authorize("admin", "pdt"), updateSemester);

router.delete("/:id", protectedRoute, authorize("admin", "pdt"), deleteSemester);

export default router;