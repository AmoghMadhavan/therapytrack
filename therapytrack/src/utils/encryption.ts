/**
 * Encryption utilities for sensitive data
 * Uses AES encryption with CryptoJS
 */

// Import CryptoJS using require syntax
const CryptoJS = require('crypto-js');

// Track if we've warned about encryption secret
let hasWarnedAboutSecret = false;

/**
 * Verify that the encryption configuration is valid
 * This is called at app startup to ensure proper setup
 * @returns True if encryption is properly configured
 */
export const verifyEncryptionSetup = (): boolean => {
  const envSecret = process.env.REACT_APP_ENCRYPTION_SECRET || '';
  
  if (!envSecret && !hasWarnedAboutSecret) {
    console.error('WARNING: Encryption secret is not set in environment variables');
    hasWarnedAboutSecret = true;
    return false;
  }
  
  return !!envSecret;
};

/**
 * Get the encryption key for a specific user
 * This combines the environment secret with the user's ID to make the encryption unique per user
 * @param userId The user ID to generate a specific key for
 * @returns A derived encryption key
 */
const getEncryptionKey = (userId: string): string => {
  const envSecret = process.env.REACT_APP_ENCRYPTION_SECRET || '';
  
  if (!envSecret) {
    console.error('Encryption secret is not set in environment variables');
    throw new Error('Encryption configuration error');
  }
  
  // Derive a unique key using the user ID and the environment secret
  return CryptoJS.SHA256(envSecret + userId).toString();
};

/**
 * Encrypt sensitive data
 * @param userId The user ID to encrypt data for
 * @param data The data to encrypt
 * @returns The encrypted data as a string
 */
export const encryptData = async (userId: string, data: string): Promise<string> => {
  try {
    if (!data) return '';
    
    const key = getEncryptionKey(userId);
    const encrypted = CryptoJS.AES.encrypt(data, key).toString();
    
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypt sensitive data
 * @param userId The user ID to decrypt data for
 * @param encryptedData The encrypted data string
 * @returns The decrypted data as a string
 */
export const decryptData = async (userId: string, encryptedData: string): Promise<string> => {
  try {
    if (!encryptedData) return '';
    
    const key = getEncryptionKey(userId);
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
    
    return decryptedText;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Check if an encrypted value can be successfully decrypted
 * Useful for validation when a user enters their key
 * @param userId The user ID to test decryption for
 * @param encryptedData The encrypted data to test
 * @returns True if decryption was successful
 */
export const validateDecryption = async (userId: string, encryptedData: string): Promise<boolean> => {
  try {
    const decrypted = await decryptData(userId, encryptedData);
    return decrypted !== '';
  } catch (error) {
    return false;
  }
}; 