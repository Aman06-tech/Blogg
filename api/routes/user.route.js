import express from 'express'
import { deleteUser, test, updateUser, signout, getUsers, getUser, toggleAdmin, getPublicStats} from '../controllers/user.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
import { apiLimiter } from '../middleware/security.middleware.js';


const router = express.Router();

router.get("/test", test);
router.get("/stats", apiLimiter, getPublicStats);
router.put('/update/:userId', apiLimiter, verifyToken, updateUser);
router.delete('/delete/:userId', apiLimiter, verifyToken, deleteUser);
router.post('/signout', apiLimiter, signout);
router.get("/getusers", apiLimiter, verifyToken, getUsers);
router.get('/:userId', apiLimiter, getUser);
router.put('/toggle-admin/:userId', apiLimiter, verifyToken, toggleAdmin);







export default router;