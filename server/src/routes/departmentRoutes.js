import { Router } from "express";
import {
    getAllDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    lockDepartment,
    unlockDepartment
} from "../controllers/departmentController.js";

import { protectedRoute } from "../middlewares/authenticateMiddleware.js";
import { authorize } from "../middlewares/rbacMiddleware.js";

const router = Router();

router.get(
    "/",
    protectedRoute,
    authorize("admin", "hr", "pdt", "ht"),
    getAllDepartments
);
router.get(
    "/:id",
    protectedRoute,
    authorize("admin", "hr", "pdt", "ht"),
    getDepartmentById
);
router.put(
    "/:id",
    protectedRoute,
    authorize("admin"),
    updateDepartment
);

router.delete(
    "/:id",
    protectedRoute,
    authorize("admin"),
    deleteDepartment
);

router.patch(
    "/:id/lock",
    protectedRoute,
    authorize("admin"),
    lockDepartment
);

router.patch(
    "/:id/unlock",
    protectedRoute,
    authorize("admin"),
    unlockDepartment
);
router.post(
    "/",
    protectedRoute,
    authorize("admin"),
    createDepartment
);

export default router;