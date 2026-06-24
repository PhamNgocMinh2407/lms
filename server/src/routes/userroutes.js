import Router from "express";
import { createUser } from "../controllers/usercontrollers.js";
import { protectedRoute } from "../middlewares/authenticateMiddleware.js";
import { authorize } from "../middlewares/rbacMiddleware.js";

const router = Router();


router.post("/", protectedRoute, authorize("admin","ht","hr"), createUser);
export default router;