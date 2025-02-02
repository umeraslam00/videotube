import { v2 as cloudinary } from 'cloudinary';
import fs from 'node:fs';
import ApiError from './ApiError.js';


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
        
        fs.unlinkSync(localFilePath)
        return response //we send the response (file) back to user so they can view it.
    } catch (error) {
        //in case of any error, corrupted files or anything that fails to upload, it is best to remove it from the server. That's why we include fs.unlink in the catch part.

        fs.unlink(localFilePath) //remove the local file as the upload operation failed.
    }
    
};

const deleteOnCloudinary = async (fileURL) => {
    try {
        if(!fileURL) {
            throw new ApiError(400, "No file to delete")
        }

        //extract the public id from url.
        /*
          Public ID: myfolder/myfile
          URL: https://res.cloudinary.com/demo/image/upload/v1596705027/myfolder/myfile.jpg
          This means we need to delete all the extra stuff to get public id.
        */

        const publicID = fileURL.split("/").slice(-2).join("/").split(".")[0];

        //Delete file using Cloudinary's destroy method.
        //https://cloudinary.com/documentation/image_upload_api_reference#destroy_method

        const response = await cloudinary.v2.uploader.destroy(publicID)

        if (result.result === "ok") {
            console.log(`Successfully deleted file: ${fileURL}`);
            return true;
        } else {
            console.error(`Failed to delete file: ${fileURL}. Response:`, result);
            return false;
        }

    } catch (error) {
        console.log ("Deleting file on Cloudinary failed", error)
    }
}

export {deleteOnCloudinary};
export default uploadOnCloudinary;