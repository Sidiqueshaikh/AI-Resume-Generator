import express from "express";
import protect from "../middlewares/authMiddleware.js";
import { checkSavedResume, checkResumeText } from "../controllers/atsController.js";

const atsRouter = express.Router();

atsRouter.post('/check-saved/:resumeId', protect, checkSavedResume)
atsRouter.post('/check-text', protect, checkResumeText)

export default atsRouter