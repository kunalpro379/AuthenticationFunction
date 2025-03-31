import express from "express";
import { googleOAuthHandler } from "../controllers/auth.controller";
import { deserializeUser } from "../middleware/deserializeUser";

const router = express.Router();

// Google OAuth routes
router.get("/google/callback", googleOAuthHandler);

export default router;