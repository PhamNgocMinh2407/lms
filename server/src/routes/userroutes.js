import Router from "express";
import { 
    createUser,
    getPrincipalDashboard,
    getAdminDashboard,
    getHRDashboard,
    getTrainingDashboard,
    getHeadDepartmentDashboard,
    getLecturerDashboard,
    getStudentDashboard
} from "../controllers/usercontrollers.js";
import { protectedRoute } from "../middlewares/authenticateMiddleware.js";
import { authorize } from "../middlewares/rbacMiddleware.js";

const router = Router();


router.post("/", protectedRoute, authorize(["admin", "ht", "hr"]), createUser);


router.get("/ht-data", protectedRoute, authorize(["ht"]), getPrincipalDashboard);

router.get("/admin-data", protectedRoute, authorize(["admin"]), getAdminDashboard);


router.get("/hr-data", protectedRoute, authorize(["hr"]), getHRDashboard);


router.get("/pdt-data", protectedRoute, authorize(["pdt"]), getTrainingDashboard);


router.get("/tbm-data", protectedRoute, authorize(["tbm"]), getHeadDepartmentDashboard);

router.get("/teacher-data", protectedRoute, authorize(["teacher"]), getLecturerDashboard);


router.get("/student-data", protectedRoute, authorize(["student"]), getStudentDashboard);

export default router;