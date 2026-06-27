import { Router } from "express";
import {
    getAllFaculties,
    createFaculty
} from "../controllers/facultyController.js";

import { protectedRoute } from "../middlewares/authenticateMiddleware.js";
import { authorize } from "../middlewares/rbacMiddleware.js";

const router = Router();

router.get(
    "/",
    protectedRoute,
    authorize("admin", "hr", "pdt", "ht"),
    getAllFaculties
);

router.post(
    "/",
    protectedRoute,
    authorize("admin"),
    createFaculty
);

export default router;