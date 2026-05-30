import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';

export async function uploadImage(file: File): Promise<string> {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;
  const result = await cloudinary.uploader.upload(base64, { folder: 'allah_fragancias' });
  return result.secure_url;
}
