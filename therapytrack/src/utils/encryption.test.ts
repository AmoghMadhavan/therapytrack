import { encryptData, decryptData, validateDecryption } from './encryption';

// Mock environment variables
beforeAll(() => {
  process.env.REACT_APP_ENCRYPTION_SECRET = 'test-encryption-secret-for-unit-tests';
});

describe('Encryption Utility', () => {
  const userId = 'test-user-123';
  const testData = 'This is sensitive information that needs to be encrypted';
  
  test('should encrypt and decrypt data successfully', async () => {
    // Encrypt the test data
    const encrypted = await encryptData(userId, testData);
    
    // Verify encrypted data is not the same as original
    expect(encrypted).not.toBe(testData);
    
    // Decrypt the data
    const decrypted = await decryptData(userId, encrypted);
    
    // Verify the decrypted data matches the original
    expect(decrypted).toBe(testData);
  });
  
  test('should return empty string when input is empty', async () => {
    // Encrypt empty string
    const encrypted = await encryptData(userId, '');
    expect(encrypted).toBe('');
    
    // Decrypt empty string
    const decrypted = await decryptData(userId, '');
    expect(decrypted).toBe('');
  });
  
  test('validateDecryption should return true for valid data', async () => {
    // Encrypt data
    const encrypted = await encryptData(userId, testData);
    
    // Validate decryption
    const isValid = await validateDecryption(userId, encrypted);
    expect(isValid).toBe(true);
  });
  
  test('validateDecryption should return false for invalid data', async () => {
    // Test with corrupted encrypted data
    const isValid = await validateDecryption(userId, 'corrupted-encrypted-data');
    expect(isValid).toBe(false);
  });
  
  test('different users should have different encryption results', async () => {
    const userId2 = 'different-user-456';
    
    // Encrypt the same data with different user IDs
    const encrypted1 = await encryptData(userId, testData);
    const encrypted2 = await encryptData(userId2, testData);
    
    // Encrypted results should be different
    expect(encrypted1).not.toBe(encrypted2);
    
    // Should not be able to decrypt with the wrong user ID
    const decrypted = await decryptData(userId2, encrypted1);
    expect(decrypted).not.toBe(testData);
  });
}); 