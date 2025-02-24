import express from "express";
import { registerUser } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = express.Router();

console.log("📢 User Routes Initialized!");

router.post("/register",
    // upload.fields([
    //     { name: "avatar", maxCount: 1 },
    //     { name: "coverImage", maxCount: 1 }
    // ]),
    registerUser
);

export default router;
