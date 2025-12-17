import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import {
    createComment,
    getPostComments,
    likeComment,
    editComment,
    deleteComment,
    getComments,
} from '../controllers/comment.controller.js';
import { apiLimiter } from '../middleware/security.middleware.js';

const router = express.Router();

router.post('/create', apiLimiter, verifyToken, createComment);
router.get('/getPostComments/:postId', apiLimiter, getPostComments);
router.put('/likeComment/:commentId', apiLimiter, verifyToken, likeComment);
router.put('/editComment/:commentId', apiLimiter, verifyToken, editComment);
router.delete('/deleteComment/:commentId', apiLimiter, verifyToken, deleteComment);
router.get('/getcomments', apiLimiter, verifyToken, getComments);

export default router;
