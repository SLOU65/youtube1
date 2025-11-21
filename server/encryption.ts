import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.YOUTUBE_API_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

// Ensure the key is exactly 32 bytes for AES-256
const KEY = Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex');

/**
 * Encrypts a YouTube API key using AES-256-CBC
 * @param text - The plain text API key to encrypt
 * @returns Object containing the encrypted text and initialization vector
 */
export function encryptApiKey(text: string): { encrypted: string; iv: string } {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    encrypted,
    iv: iv.toString('hex'),
  };
}

/**
 * Decrypts an encrypted YouTube API key
 * @param encrypted - The encrypted API key
 * @param iv - The initialization vector used during encryption
 * @returns The decrypted plain text API key
 */
export function decryptApiKey(encrypted: string, iv: string): string {
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, Buffer.from(iv, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
