import {v2 as cloudinary}from "cloudinary";
import fs from "fs";
cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_API_SECRET
});
const uploadOnCloudinary=async (localfilepath)=>
    {
try 
{
    if(!localfilepath)return console.log("File path missing");
    const response=await cloudinary.uploader.upload(localfilepath,{
resource_type:"auto"
    });
    //file upload successfull
    console.log("File is uploades successfully",response.url);
    return response;    
} 
catch (error) 
{
    fs.unlinkSync(localfilepath);
    //removes saved temporary file as the upload finished
}

};
export {uploadOnCloudinary};