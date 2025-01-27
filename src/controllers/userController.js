import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/userModel.js";
import {uploadOnCloudinary} from "../utils/cloudNary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt  from "jsonwebtoken";
//access and refresh token generation for login
const generateAccessAndRefreshTokens=async(userId)=>{
    try 
    {
        const user=await User.findById(userId); //Here User means MongodbModel userId means user ._id;
        const accessToken=user.generateAccessToken();//this access token i can  fetch from usermodel where i create it 
        const refreshToken=user.generateRefreshToken();
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false});//Here we save the refresgtoken and access token it it mandatory for login

        return {accessToken,refreshToken};//Compulsory we have to return this 

    } 
    catch (error) 
    {
        throw new ApiError(500,"Something went Wrong while generating refresh and access token");
        
    }
}
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
//login controller
const loginUser=asyncHandler(async(req,res)=>{
     //req body->data
const{email,username,password}=req.body;//Fetch from database
if(!username && !email){
    throw new ApiError(400,"Username and Email Required!");

}
 //username or email based access if the username,email exist or not 
//find the  user
const user= await User.findOne({
    $or:[{username},{email}]
 })
 if(!user){
    throw new ApiError(404,"User does not exists");
 }

//check password is correct or not
const isPasswordValid=await user.isPasswordCorrect(password);//this IsPasswordXorrect function i can call from userModel where i can match my user input password  with users save password on db
if(!isPasswordValid)
{
    throw new ApiError(401,"Password  Incorrect!");

};
//access and refresh token generation
     const {accessToken,refreshToken}=await
      generateAccessAndRefreshTokens(user._id);
      const loggedInUser=await User.findById(user._id).
      select("-password -refreshToken"); //v8 feature
      // After SuccessFully Login i want to remove my poassword an refreshtoken so i use selct and this v8 feature//
//send cookies  response  this is used for form data which come from frontend 
const options={
    httpsOnly:true,
    secure:true
}
return res.status(200).
cookie("accessToken",accessToken,options).
cookie("refreshToken",refreshToken,options).json(
    new ApiResponse(200,
        {
            user:loggedInUser,accessToken,refreshToken
        },"User LoggedIn Successfully!"
    )

)
});
//logout controller for logout i use Authenticationn if the user is a valid user then i can oerformm logout operation
const logoutUser=asyncHandler(async(req,res)=>{
await User.findByIdAndUpdate(req.user._id,
    {
        $set:{
            refreshToken:undefined
        }
    },{
        new:true
    }) 

    const options={
        httpsOnly:true,
        secure:true
    }
    return res.status(200).
    clearCookie("accessToken",options).
    clearCookie("refreshToken",options).
    json(new ApiResponse(200,{},"User Logout Successfully!"));
});
//Refresh Token controller
const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingToken= req.cookies.refreshToken||req.body.refreshToken;
    if(!incomingToken)
    {

        throw new ApiError(401,"Unauthorized Request");//If token is not valid
    }
  try {
      const decodeToken=jwt.verify(
          incomingToken,process.env.REFRESH_TOKEN_SECRET
      )
   const user=   await User.findById(decodeToken?._id);
   if(!user)
  {
      throw new ApiError(401,"Invalid Refresh Token");
  
  }
  if(incomingToken!==user?.refreshToken){
      throw new ApiError(401,"Refresh token is expired ir used");
  };
  const options={
      httpsOnly:true,
      secure:true
  }
   const {accessToken,nrefreshToken}=await generateAccessAndRefreshTokens(user._id);//creating new Token
  return res.status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",nrefreshToken,options)
  .json(new ApiResponse(200,{accessToken,refreshToken,nrefreshToken},"Access Token Refreshed"));
  
  } catch (error) 
  {
    throw new ApiError(401,error?.message||"Invalid Refresh Token");
    
  }});
  //Password change
  const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const{oldPassword,newPassword,confirmPassword}=req.body;
    const user=await User.findById(req.user?.id);
    const isPassswordCorrect=await user.isPassswordCorrect(oldPassword);
    if(!(newPassword===confirmPassword)){
        throw new ApiError("401","Password must be same as new password=confirm password")
    }
    if(!isPassswordCorrect){
        throw new ApiError(404,"Invalid Ols Password");
    }
    user.password=newPassword;
    await user.save({validateBeforeSave:false});
    return res.status(200).
    json(new ApiResponse(201,{},"Password changed Successfully"));
  });
  //Get Current User function
  const getCurrentUser=asyncHandler(async(req,res)=>{
     return res.status
     (200).json(200,req.user,"Current User Fetched Successfully");
  });

  const updateUserDetails=asyncHandler(async(req,res)=>{
    const {fullname,email}=req.body;
    if(!fullname||!email)
    {
        throw new ApiError(400,"All Fields are Required");

    }
    const user= await User.findByIdAndUpdate(req.user?._id,
    
        {
            $set:
            {
                fullname:fullname,
                email:email
            }
        },{new:true}).select("-password")
        return res.status(200).json(new ApiResponse(200,user,"Account details Updated Successfully"))

  });

  //avatar update
  const updateAvatar=asyncHandler(async(req,res)=>
{
    const avatarLocalpath=req.file?.path;
    if(!avatarLocalpath){
        new ApiError(400,"avatar is Missing ");

    }
    const avatar=await uploadOnCloudinary(avatarLocalpath);
    if(!avatar.url)
    {
        throw new ApiError(400,"Error While Uploading On avatar");

    }
    const user= await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            avatar:avatar.url
        }
    },{new:true}).select("-password");
    return res.status(200).
    json(new ApiResponse(200,"Avatar Updated SuccessFully"));
  });
//Update CoverImage
const updateCoverImage=asyncHandler(async(req,res)=>{

const coverImageLocalPath=req.file?.path;
if(!coverImageLocalPath)
    {
        throw new ApiError(404,"CoverImage path is missing");
        
}
const coverImage=await  uploadOnCloudinary(coverImageLocalPath);
if(!coverImage.url){
    throw new ApiError("Error While Uploading on cloudinary");
}
const user=await User.findByIdAndUpdate(req.user?._id,
    {
    $set:{
        coverImage:coverImage.url
    }
},
{new:true})
.select("-password");
return res.status(200).json(new ApiResponse(201,"CoverImage Updated SuccessFully"));
});

//Channel Cheking and subscription counting
const getUserChannelProfile=asyncHandler(async(req,res)=>{
    const {username}=req.params;
    if(!username){
       throw new ApiError(401,"username is missing");

    }
    const channel=await User.aggregate(
        [
            {
                $match:
                {
                    username:username?.toLowerCase()

                }}
                ,{$lookup:
                {
                   from:"subscription" ,
                   localField:"_id",
                   foreignField:"channel",
                   as:"subscribers"

                }},{$lookup:
                {
                   from:"subscription" ,
                   localField:"_id",
                   foreignField:" subscriper",
                   as:"subscriberTo"

                }},
                {
                    $addFields:
                    {
                        subscriberCount:{
                            $size:"$subscribers"
                        },
                        channelSubscriberCount:{
                            $size:"subscriberTo"
                        },
                        isSubscribed:{
                            $cond:{
                                if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                                then:true,
                                else:false
                            }
                        }

                }
            },{$project:{
                fullname:1,
                email:1,
                username:1,
                subscriberCount:1,
                channelSubscriberCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,

            }}
            
        ]);
        console.log(channel);
        if(!channel?.length){
            throw new ApiError(404,"Channel Does Not exists");
        }
        return res.status(200).json(new ApiResponse(200,channel[0],"user channel fetched Successfully"));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    changeCurrentPassword,
    updateUserDetails,
    updateAvatar,
    updateCoverImage,
    getUserChannelProfile
};