import { Router } from "express";
import { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    changeCurrentPassword,
    updateUserDetails,
    updateAvatar,
    updateCoverImage,
    getUserChannelProfile,
    getWatchHistory } from "../controllers/userController.js";
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
//Logout router
router.route("/logout").post(verifyJWT,logoutUser);//here verifyJwt is the function of the authmiddleware
//Refresh router
router.route("/refresh_token").post(refreshAccessToken);
//Change password
router.route("/change-password").post(verifyJWT,changeCurrentPassword);
//current user
router.route("/current_user").get(verifyJWT,getCurrentUser);
//update Account details
router.route("/update-account").patch(verifyJWT,updateUserDetails);
//update avatar
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateAvatar);
//update coverIMage
router.route("/coverImage").patch(verifyJWT,upload.single("coverImage"),updateCoverImage);
//get channel details
router.route("/channel/:username").get(verifyJWT,getUserChannelProfile);
//get watchhistory
router.route("/history").get(verifyJWT,getWatchHistory);
export default router;