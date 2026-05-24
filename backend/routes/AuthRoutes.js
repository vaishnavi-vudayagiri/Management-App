import express from "express";
import { registerUser, loginUser, logoutUser, verifyEmail } from "../controllers/AuthContoller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-email", verifyEmail);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

router.get("/protected", authMiddleware, (req, res) => {
    res.json({ message: "Access granted", user: req.user });
});

export default router;