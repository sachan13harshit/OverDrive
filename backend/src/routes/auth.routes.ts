import { Router } from "express";
import { getMe, redirectToGoogle, handleGoogleCallback } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router: Router = Router();

router.get("/me", requireAuth, getMe);
router.get("/google", redirectToGoogle);
router.get("/google/callback", handleGoogleCallback);

export default router;
