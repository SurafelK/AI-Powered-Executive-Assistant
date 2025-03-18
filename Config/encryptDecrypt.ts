import CryptoJS from "crypto-js";

export const encrypt = async (password: string): Promise<{ encrypted: string | boolean }> => {
    try {
        const ENCRYPTION_SECRET_KEY = process.env.ENCRYPTION_SECRET_KEY;
      
        if (!ENCRYPTION_SECRET_KEY) {
            return { encrypted: false };
        }
        const encrypted = CryptoJS.AES.encrypt(password, ENCRYPTION_SECRET_KEY).toString();
        return { encrypted };
    } catch (error) {
        return { encrypted: false };
    }
};

export const decrypt = async (ciphertext: string): Promise<{ decrypted: string | boolean }> => {
    try {
        const ENCRYPTION_SECRET_KEY = process.env.ENCRYPTION_SECRET_KEY;
        if (!ENCRYPTION_SECRET_KEY) {
            return { decrypted: false };
        }
        const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_SECRET_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return decrypted ? { decrypted } : { decrypted: false };
    } catch (error) {
        console.error("Decryption error:", error);
        return { decrypted: false };
    }
};
