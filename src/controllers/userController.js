import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/userModel.js";
import {uploadOnCloudinary} from "../utils/cloudNary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
//Register Controller
const registerUser=asyncHandler(async(req,res)=>{
//Get userDetails from frontend
const {username,password,email,fullname}=req.body;
console.log("username",username);
//Validation-- check  Empty or not
// if(fullname==="")
// {
// throw new ApiError(400,"full name is Required");
// }
//old way :we can use the above  approach{if ,else if,else for validation} but insted if using a lot of lines of code  so the best way make a array if conditions and check the fileds is empty or not;

if(
    [fullname,username,email,password].some((field) =>
    field?.trim()==="")
)
{
throw new ApiError(400,"All fileds Are required!");
 }
//check if user already exists by their  username,email
const existingUser=User.findOne({
    $or:[{username},{email}]
});
if(existingUser){
    throw new ApiError(409,"User With Email and username Already exists u can create a duplicate user ");
}
//check  for images ,check for avatar 
const avatarLocalpath=req.files?.avatar[0]?.path;
const coverImageLocation=req.files?.coverImage[0]?.path;
if(!avatarLocalpath){
    throw new ApiError(400,"avatar is required ");

}
//upload them to cloudnary,check avatar is uploaded or not;

const avatar=await uploadOnCloudinary(avatarLocalpath);
const coverImage=await uploadOnCloudinary(coverImageLocation);
if(!avatar){
    throw new ApiError(400,"Avatar filed required");
}
//create user object--create entry in db:
const user=await User.create({
    fullname:fullname.toLowercase,
    avatar:avatar.url,
    coverImage:coverImage?.url || "" ,
    email,
    password,
    username:username.toLowercase()

});
//check for userCreation and remove password and refresh token field from response

const createdUser=await User.findById(user._id).select(
    "-password -refreshToken"//v8 feature
);

if(!createdUser){
    throw new ApiError(500,"Something went wrong while registering the User");
}
//return API Response;  
return res.status(201).json(
    new ApiResponse(200,createdUser,"User Registred Successfully")
);

});
export {registerUser};