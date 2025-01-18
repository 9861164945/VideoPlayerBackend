import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/userController.js";
import {upload} from '../middlewares/multerMiddleware.js';
import { verifyJWT } from "../middlewares/authMiddleware.js";
const router=Router();
//Register Router
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
    registerUser);//here upload is a middleware function of multermiddleware
//Login Router
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT,logoutUser);//here verifyJwt is the function of the authmiddleware
export default router;