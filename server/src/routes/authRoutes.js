import express from 'express';
import { signIn,signup,signOut } from '../controllers/authcontrollers.js';
const router = express.Router();

router.post("/signup", signup);

router.post("/signin", signIn);

router.post("/signout", signOut);   

export default router;

