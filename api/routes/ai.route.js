import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import { enhanceContent, generateTitleSuggestions } from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/enhance", verifyToken, enhanceContent);
router.post("/titles", verifyToken, generateTitleSuggestions);

export default router;
