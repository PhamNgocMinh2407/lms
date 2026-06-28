import { Router } from "express";

import {
    getAllRooms,
    getRoomById,
    createRoom,
    updateRoom,
    deleteRoom,
    lockRoom,
    unlockRoom
} from "../controllers/roomController.js";

import { protectedRoute } from "../middlewares/authenticateMiddleware.js";
import { authorize } from "../middlewares/rbacMiddleware.js";

const router = Router();

router.get("/", protectedRoute, authorize("admin", "pdt", "ht", "teacher"), getAllRooms);

router.get("/:id", protectedRoute, authorize("admin", "pdt", "ht", "teacher"), getRoomById);

router.post("/", protectedRoute, authorize("admin", "pdt"), createRoom);

router.put("/:id", protectedRoute, authorize("admin", "pdt"), updateRoom);

router.delete("/:id", protectedRoute, authorize("admin", "pdt"), deleteRoom);

router.patch("/:id/lock", protectedRoute, authorize("admin", "pdt"), lockRoom);

router.patch("/:id/unlock", protectedRoute, authorize("admin", "pdt"), unlockRoom);

export default router;