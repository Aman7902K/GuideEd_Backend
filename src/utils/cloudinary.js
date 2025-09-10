import {v2} from 'cloudinary';
import fs from 'fs';

v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_SECRET,
});

const uploadOnCloudinary = async (filePath) => {
    try{
        if (!filePath) return null

        const resp = await v2.uploader.upload(filePath,{
            resource_type:"auto",
        })  
        console.log("File is Uploaded on ",
            resp.url
        );
        return resp
        
    }
    catch(err){
        fs.unlinkSync(filePath)
        return null
    }
}
