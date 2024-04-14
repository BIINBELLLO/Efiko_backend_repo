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
  fs.unlinkSync(req.files?.image.tempFilePath)

  return result
}

const uploadMultiple = async (req, destination) => {
  let finalImage = {}
  for (let key in req.files) {
    console.log("key:", key, "value:", req.files[key])
    result = await cloudinary.uploader.upload(req.files[key].tempFilePath, {
      use_filename: true,
      folder: `efiko/${destination}`,
    })
    fs.unlinkSync(req.files[key].tempFilePath)
    finalImage[key] = result.url
  }
  return finalImage
}
module.exports = { uploadManager, uploadMultiple }
