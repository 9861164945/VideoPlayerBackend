import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const uploadOnCloudinary = async (localFilepath) => {
  try {
    if (!localFilepath) {
      console.log("File path missing");
      return null;
    }
    
    // Upload file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilepath, {
      resource_type: "auto", // Automatically detect file type (image/video/etc.)
    });

    // File uploaded successfully
    console.log("File is uploaded successfully:", response.url);
    
    // Remove the temporary file after upload
    fs.unlinkSync(localFilepath);
    
    return response;
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);

    // Clean up temporary file even on error
    if (fs.existsSync(localFilepath)) {
      fs.unlinkSync(localFilepath);
    }
    
    return null; // Return null to indicate failure
  }
};

export { uploadOnCloudinary };
