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
console.log("password",password);
console.log("email",email);
console.log("fullname",fullname);



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
const existingUser=await User.findOne({
    $or:[{username},{email}]
});
if(existingUser){
    throw new ApiError(409,"User With Email and username Already exists u can not create a duplicate user ");
}
console.log("Uploaded files: " + JSON.stringify(req.files));  // This will convert it to a string representation
//check  for images ,check for avatar 
const avatarLocalpath=req.files?.avatar[0]?.path;
//const coverImageLocation=req.files?.coverImage[0]?.path;
let coverImageLocalPath = [];
if (req.files && Array.isArray(req.files.coverImage)) {
    coverImageLocalPath = req.files.coverImage.map((file) => file.path);
  }
if(!avatarLocalpath){
    throw new ApiError(400,"avatar is required ");

}
//upload them to cloudnary,check avatar is uploaded or not;

const avatar=await uploadOnCloudinary(avatarLocalpath);
const coverImage = await Promise.all(
    coverImageLocalPath.map(path => uploadOnCloudinary(path))
  );

console.log("Ac",avatar);
console.log('ci',coverImage);
if(!avatar||!avatar.url){
    throw new ApiError(400,"Avatar file is  required");
}

// Handle multiple cover images if uploaded
const coverImageUrls = [];
if (coverImageLocalPath.length > 0) {
  for (let path of coverImageLocalPath) {
    const coverImage = await uploadOnCloudinary(path);
    if (coverImage && coverImage.url) {
      coverImageUrls.push(coverImage.url);
    }
  }
}
//create user object--create entry in db:
const user=await User.create({
    fullname:fullname.toLowerCase(),
    avatar:avatar.url,
    coverImage:coverImageUrls.join(", ")|| "" ,//JoinMultiople CoverImage
    email,
    password,
    username:username.toLowerCase()

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