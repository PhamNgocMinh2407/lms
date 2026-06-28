import { Router } from "express";

import {
    getAllClasses,
    getClassById,
    createClass,
    updateClass,
    deleteClass,
    lockClass,
    unlockClass
} from "../controllers/classController.js";

import { protectedRoute } from "../middlewares/authenticateMiddleware.js";
import { authorize } from "../middlewares/rbacMiddleware.js";

const router = Router();

router.get("/", protectedRoute, authorize("admin", "pdt", "ht", "hr"), getAllClasses);

router.get("/:id", protectedRoute, authorize("admin", "pdt", "ht", "hr"), getClassById);

router.post("/", protectedRoute, authorize("admin", "pdt"), createClass);

router.put("/:id", protectedRoute, authorize("admin", "pdt"), updateClass);

router.delete("/:id", protectedRoute, authorize("admin", "pdt"), deleteClass);

router.patch("/:id/lock", protectedRoute, authorize("admin", "pdt"), lockClass);

router.patch("/:id/unlock", protectedRoute, authorize("admin", "pdt"), unlockClass);

export default router;