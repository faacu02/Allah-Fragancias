import { env } from './env';

export async function sendAdminWhatsApp(message: string): Promise<boolean> {
  const apiKey = env.CALLMEBOT_APIKEY;
  const phone = env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (!apiKey || !phone) return false;

  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(message)}&apikey=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      console.error('CallMeBot error:', res.status, text);
    }
    return res.ok;
  } catch (err) {
    console.error('Error enviando WhatsApp:', err);
    return false;
  }
}
