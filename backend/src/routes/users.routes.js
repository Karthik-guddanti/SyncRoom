import { Router } from "express";
import { addToHistory, getUserHistory, login, register } from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/add_to_activity", protect, addToHistory);
router.get("/get_all_activity", protect, getUserHistory);

export default router;