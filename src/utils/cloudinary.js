import { v2 as cloudinary } from "cloudinary"
import fs from "fs"


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return ""
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        console.log("file is uploaded on cloudinary ", response.url);
        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        // fs.unlink(localFilePath)
        return response;

    } catch (error) {
        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        } // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

const deleteOnCloudinary = async (url) => {
    try {
        if (!url) {
            throw new Error("URL is required to delete the image");
        }

        // Extract the public ID from the URL
        const publicId = url.split('/').pop().split('.')[0];

        await cloudinary.uploader.destroy(publicId, { invalidate: true, resource_type: "image" });

        console.log("Image deleted from Cloudinary:", url);
    } catch (error) {
        console.log("Error deleting image:", error);
    }
}



export { uploadOnCloudinary, deleteOnCloudinary }