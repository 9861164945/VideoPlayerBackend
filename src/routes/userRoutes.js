import { Router } from "express";
import { registerUser } from "../controllers/userController.js";
import {upload} from '../middlewares/multerMiddleware.js';
const router=Router();
router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
            {
                name:"coverImage",
                maxCount:3
            }
    ]),
    registerUser);

export default router;