const cloudinary = require("cloudinary").v2
const { config } = require("../core/config")
const fs = require("fs")

cloudinary.config({
  cloud_name: config.CLOUDINARY_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
})

const uploadManager = async (req, destination) => {
  const result = await cloudinary.uploader.upload(
    req.files.image.tempFilePath,
    {
      use_filename: true,
      folder: `efiko/${destination}`,
    }
  )
  fs.unlinkSync(req.files.image.tempFilePath)

  return result
}
module.exports = { uploadManager }
