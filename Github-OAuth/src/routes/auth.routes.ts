import express from "express";
import {
    githubOAuthHandler,
    loginHandler,
    logoutHandler,
    registerHandler
} from "../controllers/auth.controller";
import { requireUser } from "../middleware/requireUser";
import { validate } from "../middleware/validate";
import {
    createUserSchema,
    loginUserSchema
} from "../schema/User.schema";
import { deserializeUser } from "../middleware/deserializeUser";

const router = express.Router();

// Auth routes
router.post("/register", validate(createUserSchema), registerHandler);
router.post("/login", validate(loginUserSchema), loginHandler);
router.get("/logout", deserializeUser, requireUser, logoutHandler);

// OAuth routes
router.get("/github/callback", githubOAuthHandler);

export default router;