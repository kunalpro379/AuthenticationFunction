import express from 'express';
import { getMeHandler } from '../controllers/user.controller';
import { requireUser } from '../middleware/requireUser';
import { deserializeUser } from '../middleware/deserializeUser';
const router = express.Router();
router.use(deserializeUser, requireUser);
router.get('/me', getMeHandler);
export default router;