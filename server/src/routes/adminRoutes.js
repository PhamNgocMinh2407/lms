import { Router } from "express";

import {
     getAdminDashboard,
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    lockUser,
    unlockUser,
    changeRole,
    resetUserPassword
} from "../controllers/adminController.js";
import { protectedRoute } from "../middlewares/authenticateMiddleware.js";
import { authorize } from "../middlewares/rbacMiddleware.js";

const router = Router();


    //User Management

router.get(
    "/dashboard",
    protectedRoute,
    authorize("admin"),
    getAdminDashboard
);

router.get(
    "/users",
    protectedRoute,
    authorize("admin"),
    getAllUsers
);
router.get(
    "/users/:id",
    protectedRoute,
    authorize("admin"),
    getUserById
);
router.post(
    "/users",
    protectedRoute,
    authorize("admin"),
    createUser
);
router.put(
    "/users/:id",
    protectedRoute,
    authorize("admin"),
    updateUser
);
router.delete(
    "/users/:id",
    protectedRoute,
    authorize("admin"),
    deleteUser
);
router.patch(
    "/users/:id/lock",
    protectedRoute,
    authorize("admin"),
    lockUser
);

router.patch(
    "/users/:id/unlock",
    protectedRoute,
    authorize("admin"),
    unlockUser
);
router.patch(
    "/users/:id/role",
    protectedRoute,
    authorize("admin"),
    changeRole
);
router.patch(
    "/users/:id/reset-password",
    protectedRoute,
    authorize("admin"),
    resetUserPassword
);
export default router;