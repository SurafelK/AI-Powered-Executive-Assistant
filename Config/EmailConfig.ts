import { getIMAPCOMPANY } from './../Email/emailSupport';
import imaps from "imap-simple";
import { getIMAPHost } from "../Email/emailSupport";

export const getProviderFromEmail = (email: string): string | null => {
    if (!email.includes("@")) return null; // Validate email format
    return email.split("@")[1].split(".")[0]; // Extract the provider (before the first dot)
};

export const emailLogin = async (
  email: string,
  password: string,
  host: string,
  tls: boolean
): Promise<string | boolean> => {
  try {
    let provider = getIMAPHost(email, host); // First attempt with known provider

    let hostsToTry = provider ? [provider] : getIMAPCOMPANY(email, host);

    for (const imapHost of hostsToTry) {
      const config = {
        imap: {
          user: email,
          password: password,
          host: imapHost,
          port: 993,
          tls: true,
          tlsOptions: { rejectUnauthorized: false }, // Ignore certificate validation
          authTimeout: 10000, // 10 seconds timeout
        },
      };

      try {
        const connection = await imaps.connect(config);
        if (connection) {
          await connection.end(); // Ensure proper logout
          return imapHost;
        }
      } catch (error) {
        console.warn(`Failed to connect to IMAP host: ${imapHost}`, error);
      }
    }

    return false;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("IMAP login failed:", error.message);
    } else {
      console.error("IMAP login failed:", error);
    }
    return false;
  }
};
