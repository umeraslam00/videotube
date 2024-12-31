import { v2 as cloudinary } from 'cloudinary';
import fs from 'node:fs';


// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null; // No file to upload
        //upload file
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        })
        console.log("File uploaded successfully.", response.url)
        return response //we send the response (file) back to user so they can view it.
    } catch (error) {
        //in case of any error, corrupted files or anything that fails to upload, it is best to remove it from the server. That's why we include fs.unlink in the catch part.

        fs.unlink(localFilePath) //remove the local file as the upload operation failed.
    }
    
};

export default uploadOnCloudinary;