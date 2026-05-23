import { v2 as cloudinary } from 'cloudinary';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error(
    'Faltan variables de entorno de Cloudinary. Asegúrate de que CLOUDINARY_CLOUD_NAME, ' +
    'CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET estén configuradas en las variables de entorno.'
  );
}

cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

export default cloudinary;

export async function uploadImage(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;
  const result = await cloudinary.uploader.upload(base64, { folder: 'allah_fragancias' });
  return result.secure_url;
}
