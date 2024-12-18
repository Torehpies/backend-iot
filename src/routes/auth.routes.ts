import { Router } from "express";
import { login, register, verifyEmail } from "../controllers/auth.controller";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.get("/verify/:token", verifyEmail);

export default router;