import express from 'express';
import { signin, signup, google, signout } from '../controllers/auth.controller.simple.js';
import { loginLimiter, createAccountLimiter, apiLimiter } from '../middleware/security.middleware.js';

const router = express.Router();

router.post('/signup', createAccountLimiter, signup);
router.post('/signin', loginLimiter, signin);
router.post('/google', loginLimiter, google);
router.post('/signout', apiLimiter, signout);

export default router;