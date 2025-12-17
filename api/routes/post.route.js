import express from 'express';
import { verifyToken }  from '../utils/verifyUser.js';
import { create, deletepost, getposts, updatepost, likePost } from '../controllers/post.controller.js';
import { apiLimiter } from '../middleware/security.middleware.js';

const  router = express.Router();


router.post('/create', apiLimiter, verifyToken, create)
router.get("/getposts", apiLimiter, getposts)
router.delete("/deletepost/:postId/:userId", apiLimiter, verifyToken, deletepost)
router.put('/updatePost/:postId/:userId', apiLimiter, verifyToken, updatepost)
router.put('/likePost/:postId', apiLimiter, verifyToken, likePost)

export default router;