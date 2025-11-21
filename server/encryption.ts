import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';

// Get or generate encryption key
function getEncryptionKey(): Buffer {
  const keyEnv = process.env.YOUTUBE_API_ENCRYPTION_KEY;
  
  if (!keyEnv) {
    // Generate a new key if not provided
    const newKey = crypto.randomBytes(32);
    console.warn('[Encryption] No YOUTUBE_API_ENCRYPTION_KEY provided, using generated key');
    return newKey;
  }
  
  // If the key is hex-encoded (64 chars), decode it
  if (keyEnv.length === 64 && /^[a-f0-9]{64}$/i.test(keyEnv)) {
    return Buffer.from(keyEnv, 'hex');
  }
  
  // If the key is base64-encoded, decode it
  if (keyEnv.length === 44 && keyEnv.endsWith('=')) {
    try {
      return Buffer.from(keyEnv, 'base64');
    } catch (e) {
      // Fall through to hash approach
    }
  }
  
  // Hash the provided string to get a consistent 32-byte key
  return crypto.createHash('sha256').update(keyEnv).digest();
}

const KEY = getEncryptionKey();

/**
 * Encrypts a YouTube API key using AES-256-CBC
 * @param text - The plain text API key to encrypt
 * @returns Object containing the encrypted text and initialization vector
 */
export function encryptApiKey(text: string): { encrypted: string; iv: string } {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encrypted,
      iv: iv.toString('hex'),
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[Encryption Error]', errorMsg);
    throw new Error(`Failed to encrypt API key: ${errorMsg}`);
  }
}

/**
 * Decrypts an encrypted YouTube API key
 * @param encrypted - The encrypted API key
 * @param iv - The initialization vector used during encryption
 * @returns The decrypted plain text API key
 */
export function decryptApiKey(encrypted: string, iv: string): string {
  try {
    // Validate inputs
    if (!encrypted || typeof encrypted !== 'string') {
      throw new Error('Invalid encrypted data: must be a non-empty string');
    }
    if (!iv || typeof iv !== 'string') {
      throw new Error('Invalid IV: must be a non-empty string');
    }
    
    // Validate hex format
    if (!/^[a-f0-9]*$/i.test(encrypted)) {
      throw new Error('Encrypted data must be in hexadecimal format');
    }
    if (!/^[a-f0-9]*$/i.test(iv)) {
      throw new Error('IV must be in hexadecimal format');
    }
    
    // Validate IV length (should be 32 chars = 16 bytes)
    if (iv.length !== 32) {
      throw new Error(`Invalid IV length: expected 32 hex chars (16 bytes), got ${iv.length}`);
    }
    
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, Buffer.from(iv, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[Decryption Error]', errorMsg);
    throw new Error(`Failed to decrypt API key: ${errorMsg}`);
  }
}
