import { encryptData, decryptData } from '../utils/encryption';
import { supabase } from '../lib/supabase/config';
import { handleGlobalError, ErrorType } from '../hooks/useErrorHandler';

/**
 * Types of sensitive data that may need encryption
 */
export enum SensitiveDataType {
  SessionNotes = 'session_notes',
  ClientMedicalInfo = 'client_medical_info',
  PrivateNotes = 'private_notes',
  ContactInfo = 'contact_info',
}

/**
 * Service for handling sensitive data with encryption
 */
export const secureDataService = {
  /**
   * Encrypt and save sensitive data
   * @param userId The user ID of the current user
   * @param dataType The type of sensitive data
   * @param recordId The ID of the record to associate the data with
   * @param data The data to encrypt and save
   * @returns True if successful, false otherwise
   */
  async saveEncryptedData(
    userId: string,
    dataType: SensitiveDataType,
    recordId: string,
    data: string
  ): Promise<boolean> {
    try {
      // Encrypt the data using the user's ID for key derivation
      const encryptedData = await encryptData(userId, data);
      
      // Save the encrypted data to the database
      const { error } = await supabase
        .from('encrypted_data')
        .upsert({
          user_id: userId,
          data_type: dataType,
          record_id: recordId,
          encrypted_content: encryptedData,
          last_updated: new Date().toISOString()
        });
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      handleGlobalError(error, {
        defaultMessage: 'Failed to save encrypted data',
        type: ErrorType.Security
      });
      return false;
    }
  },
  
  /**
   * Retrieve and decrypt sensitive data
   * @param userId The user ID of the current user
   * @param dataType The type of sensitive data
   * @param recordId The ID of the record associated with the data
   * @returns The decrypted data or null if not found/error
   */
  async getDecryptedData(
    userId: string,
    dataType: SensitiveDataType,
    recordId: string
  ): Promise<string | null> {
    try {
      // Retrieve the encrypted data from the database
      const { data, error } = await supabase
        .from('encrypted_data')
        .select('encrypted_content')
        .eq('user_id', userId)
        .eq('data_type', dataType)
        .eq('record_id', recordId)
        .single();
      
      if (error) {
        // If not found, return null instead of throwing
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }
      
      if (!data?.encrypted_content) {
        return null;
      }
      
      // Decrypt the data using the user's ID for key derivation
      const decryptedData = await decryptData(userId, data.encrypted_content);
      return decryptedData;
    } catch (error) {
      handleGlobalError(error, {
        defaultMessage: 'Failed to retrieve encrypted data',
        type: ErrorType.Security
      });
      return null;
    }
  },
  
  /**
   * Encrypt sensitive fields in an object
   * @param userId The user ID of the current user
   * @param obj The object containing fields to encrypt
   * @param fieldsToEncrypt Array of field names that need encryption
   * @returns A new object with encrypted fields
   */
  async encryptObjectFields<T extends Record<string, any>>(
    userId: string,
    obj: T,
    fieldsToEncrypt: (keyof T)[]
  ): Promise<T> {
    const result = { ...obj };
    
    for (const field of fieldsToEncrypt) {
      if (obj[field] && typeof obj[field] === 'string') {
        // Need to cast to any to avoid TypeScript errors with generic indexing
        (result as any)[field] = await encryptData(userId, obj[field] as string);
      }
    }
    
    return result;
  },
  
  /**
   * Decrypt sensitive fields in an object
   * @param userId The user ID of the current user
   * @param obj The object containing fields to decrypt
   * @param fieldsToDecrypt Array of field names that need decryption
   * @returns A new object with decrypted fields
   */
  async decryptObjectFields<T extends Record<string, any>>(
    userId: string,
    obj: T,
    fieldsToDecrypt: (keyof T)[]
  ): Promise<T> {
    const result = { ...obj };
    
    for (const field of fieldsToDecrypt) {
      if (obj[field] && typeof obj[field] === 'string') {
        // Need to cast to any to avoid TypeScript errors with generic indexing
        (result as any)[field] = await decryptData(userId, obj[field] as string);
      }
    }
    
    return result;
  }
}; 