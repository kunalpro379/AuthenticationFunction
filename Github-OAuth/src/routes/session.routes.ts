import express from 'express';
import { githubOAuthHandler } from '../controllers/auth.controller';
const router = express.Router();    
router.get("/oauth/github", githubOAuthHandler);
export default router;