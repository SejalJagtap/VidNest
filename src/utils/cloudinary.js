
import fs from 'fs'

// unlink=delete

import { v2 as cloudinary } from 'cloudinary';
import { response } from 'express';



// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.envCLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});
// Upload an image
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        await cloudinary.uploader
            .upload(
                localFilePath, {
                public_id: 'shoes',
                resource_type: "auto"
            }
            )
        //file has been uploaded on successfully

        console.log("file has been uploaded", response.url());
        return response



    } catch (error) {
        fs.unlinkSync(localFilePath)  // remove the locally temp saved file 
        return null
    }
}

export { uploadOnCloudinary }





