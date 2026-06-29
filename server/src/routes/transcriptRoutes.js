import { Router } from "express";


import {
    getMyTranscript,
    getStudentTranscript
} from "../controllers/transcriptController.js";

import { protectedRoute } from "../middlewares/authenticateMiddleware.js";
import { authorize } from "../middlewares/rbacMiddleware.js";

const router = Router();

router.get(
    "/my-transcript",
    protectedRoute,
    authorize("student"),
    getMyTranscript
);
router.get(
    "/student/:id",
    protectedRoute,
    authorize("admin", "pdt", "ht", "tbm"),
    getStudentTranscript
);
export default router;