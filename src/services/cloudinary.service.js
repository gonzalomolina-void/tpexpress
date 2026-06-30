import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Sube una imagen desde una URL externa a Cloudinary, convirtiéndola a WebP.
 *
 * @param {string} url - URL absoluta de la imagen a subir.
 * @returns {Promise<string>} El public_id generado por Cloudinary.
 */
export async function uploadFromUrl(url) {
  const result = await cloudinary.uploader.upload(url, {
    folder: 'cards',
    format: 'webp'
  });

  return result.public_id;
}
