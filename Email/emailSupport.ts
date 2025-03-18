import { decrypt } from "../Config/encryptDecrypt";
import { UserAccountModel } from "../model/userAccounts";
import imaps from "imap-simple";

export const respondAllEmail = async () => {
    try {
        const respondToEmails = await UserAccountModel.find({ respondAllEmail: true });

        for (const emailData of respondToEmails) {
            const decryptedPass = await decrypt(emailData.password);
            if (!decryptedPass || !decryptedPass.decrypted) {
                console.error(`Failed to decrypt password for ${emailData.email}`);
                continue;
            }

            const password = decryptedPass.decrypted.toString()
            const unreadEmails = await getUnreadEmails(
                emailData.email,
                password,
                emailData.hostname // Ensure this is always a string
            );

            console.log(`Unread emails for ${emailData.email}:`, unreadEmails);
        }
    } catch (error) {
        console.error("Error in respondAllEmail:", error);
    }
};


const getUnreadEmails = async (
    email: string,
    password: string,
    host: string
) => {
    try {
        const config = {
            imap: {
                user: email,
                password: password,
                host: host, // Use mapped IMAP host
                port: 993,
                tls: true,
                tlsOptions: { rejectUnauthorized: false },
                authTimeout: 10000,
            },
        };

        // Connect to IMAP server
        const connection = await imaps.connect(config);
        await connection.openBox("INBOX");

        // Search for unread emails
        const searchCriteria = ["UNSEEN"];
        const fetchOptions = {
            bodies: ["HEADER", "TEXT"],
            struct: true,
        };

        const messages = await connection.search(searchCriteria, fetchOptions);

        // Extract unread email details
        const unreadEmails = messages.map((message) => {
            const header = message.parts.find((part) => part.which === "HEADER");
            return {
                from: header?.body.from?.[0] || "Unknown",
                subject: header?.body.subject?.[0] || "No Subject",
                date: header?.body.date?.[0] || "Unknown",
                body: message.parts.find((part) => part.which === "TEXT")?.body || "No Content",
            };
        });

        // Close the connection
        await connection.end();

        return unreadEmails;
    } catch (error) {
        console.error("Error fetching unread emails:", error);
        return [];
    }
};

// Function to map email providers to IMAP hosts
export const getIMAPHost = (email: string, provider?: string): string | null => {
    const defaultProviders: Record<string, string> = {
      gmail: "imap.gmail.com",
      yahoo: "imap.mail.yahoo.com",
      outlook: "outlook.office365.com",
      aol: "imap.aol.com",
      icloud: "imap.mail.me.com",
    };
  
    if (provider && defaultProviders[provider.toLowerCase()]) {
      return defaultProviders[provider.toLowerCase()];
    }
  
    return null;
  };
  
// Function to generate multiple possible IMAP hosts for company email
export const getIMAPCOMPANY = (email: string, provider: string): string[] => {
    try {
      const domain = email.split("@")[1]; // Extract domain from email
      if (!domain) return [];
  
      return [
        `imap.${domain}`,
        `mail.${domain}`,
        `email.${domain}`,
        `webmail.${domain}`,
      ]; // All possible host formats
    } catch (error) {
      console.error("Error generating IMAP hosts:", error);
      return [];
    }
  };