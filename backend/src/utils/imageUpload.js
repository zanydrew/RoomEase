const cloudinary = require("../config/cloudinary");

const opts = {
  overwrite: true,
  invalidate: true,
  resource_type: "auto",
};

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];


const validateBase64Image = (base64) => {
  const match = base64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9]+);base64,/);

  if (!match) {
    throw { status: 400, message: "Invalid image format." };
  }

  const mimeType = match[1];

  if (!ALLOWED_TYPES.includes(mimeType)) {
    throw {
      status: 400,
      message: "Only JPEG, JPG, PNG, and WebP images are allowed.",
    };
  }
};

const uploadImage = (image, folder = "roomease/rooms") => {
  return new Promise((resolve, reject) => {
    try {
      validateBase64Image(image);
    } catch (err) {
      return reject(err);
    }

    cloudinary.uploader.upload(
      image,
      { ...opts, folder },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url });
      }
    );
  });
};


const uploadMultipleImages = (images, folder = "roomease/rooms") => {
  return Promise.all(images.map((base) => uploadImage(base, folder)));
};

const deleteFromCloudinary = (publicIdOrUrl) => {
  if (!publicIdOrUrl) return Promise.resolve();

  // Match everything after "/upload/", skip the optional version, and capture up to the file extension
  const match = publicIdOrUrl.match(/\/upload\/(?:v\d+\/)?([^\.]+)\.[a-z]+$/i);
  const publicId = match ? match[1] : publicIdOrUrl;

  return cloudinary.uploader.destroy(publicId);
};

module.exports = {
  uploadImage,
  uploadMultipleImages,
  deleteFromCloudinary,
};
