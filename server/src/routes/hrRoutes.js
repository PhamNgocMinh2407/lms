import { Router } from "express";
import { getAllStaffs, getHRDashboard } from "../controllers/hrController.js";
import { protectedRoute } from "../middlewares/authenticateMiddleware.js";
import { authorize } from "../middlewares/rbacMiddleware.js";

const router = Router();

router.get(
    "/staffs",
    protectedRoute,
    authorize("hr", "admin"),
    getAllStaffs
);
router.get(
    "/dashboard",
    protectedRoute,
    authorize("hr", "admin"),
    getHRDashboard
);
export default router;