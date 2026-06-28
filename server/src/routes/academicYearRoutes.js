import { Router } from "express";

import {
    getAllAcademicYears,
    getAcademicYearById,
    createAcademicYear,
    updateAcademicYear,
    deleteAcademicYear
} from "../controllers/academicYearController.js";

import { protectedRoute } from "../middlewares/authenticateMiddleware.js";
import { authorize } from "../middlewares/rbacMiddleware.js";

const router = Router();

router.get("/", protectedRoute, authorize("admin", "pdt", "ht"), getAllAcademicYears);

router.get("/:id", protectedRoute, authorize("admin", "pdt", "ht"), getAcademicYearById);

router.post("/", protectedRoute, authorize("admin", "pdt"), createAcademicYear);

router.put("/:id", protectedRoute, authorize("admin", "pdt"), updateAcademicYear);

router.delete("/:id", protectedRoute, authorize("admin", "pdt"), deleteAcademicYear);

export default router;