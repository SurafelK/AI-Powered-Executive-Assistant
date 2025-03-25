import { decrypt } from "../Config/encryptDecrypt";
import { UserAccountModel } from "../model/userAccounts";
import imaps from "imap-simple";
import { decode } from "iconv-lite";
import { simpleParser } from "mailparser";
import { getGeminiResponse, sendEmail } from "./SendResponse";
import * as cheerio from 'cheerio';

interface MessagePart {
    which: string;
    body: string;
}

interface Message {
    parts: MessagePart[];
}

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
            
            console.log(`Unread emails for  ${emailData.email}:`, unreadEmails);
            for ( let i = 0 ; i < unreadEmails.length; i++ ){
               const response = await getGeminiResponse(unreadEmails[i].subject, unreadEmails[i].body, unreadEmails[i].from)
               console.log(unreadEmails)
               const sendResponse = await sendEmail(emailData.email,unreadEmails[i].from, response, emailData.hostname, password)
               if(sendResponse.success){
                console.log("Sent Successfully")
                await markEmailAsRead(emailData.email, password, emailData.hostname, unreadEmails[i].date);
             
               }
               if(sendResponse.error){
                console.log("Not Sent")
               }
            }
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
                host: host,
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

        const unreadEmails = await Promise.all(
            messages.map(async (message) => {
                if (!message.parts || !Array.isArray(message.parts)) {
                    console.error("Invalid message format:", message);
                    return null;
                }
        
                let headerPart = message.parts.find(part => part.which === 'HEADER');
                let textPart = message.parts.find(part => part.which === 'TEXT');
        
                if (!headerPart || !textPart) {
                    console.warn("Missing email parts:", message);
                    return null;
                }
        
                const header = headerPart.body || {};
                const textBody = textPart.body || "No Content";
        
                try {
                    // Parse the email
                    const parsedEmail = await simpleParser(textBody);
        
                    // Extract plain text body, falling back to cleaned HTML if necessary
                    let emailBody = parsedEmail.text?.trim() || "";
                    if (!emailBody && parsedEmail.html) {
                        emailBody = parsedEmail.html.replace(/<\/?[^>]+(>|$)/g, ""); // Remove HTML tags
                    }
                    const cleanBody = await extractPlainText (emailBody);
            
                    return {
                        from: header.from?.[0] || "Unknown",
                        subject: header.subject?.[0] || "No Subject",
                        date: header.date?.[0] || "Unknown",
                        body: cleanBody || "No Content",
                    };
                } catch (error) {
                    console.error("Error parsing email:", error);
                    return null;
                }
            })
        );
        
        // Remove null values from results
        const filteredEmails = unreadEmails.filter(email => email !== null);
        
        // Close the connection
        await connection.end();
        
        return filteredEmails;
        
        
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
  
  export const extractEmailBody = (mimeBody: string): string => {
    // Decode quoted-printable encoding
    const decodeQuotedPrintable = (text: string): string =>
        text
            .replace(/=\r\n/g, '') // Remove soft line breaks
            .replace(/=\n/g, '')
            .replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16))); // Decode hex chars

    // Extract HTML content from MIME
    const htmlMatch = mimeBody.match(/Content-Type:\s*text\/html[\s\S]*?\n\n([\s\S]*?)(?:\n\n------|$)/i);
    if (!htmlMatch || !htmlMatch[1]) return 'No Content';

    // Decode HTML content and parse with Cheerio
    const decodedHtml = decodeQuotedPrintable(htmlMatch[1]);
    const $ = cheerio.load(decodedHtml);

    return $('body').text().replace(/\s+/g, ' ').trim(); // Extract and clean text
};
  const extractPlainText = (mimeBody: string): string => {
    console.log(mimeBody);

    // Extract the MIME boundary dynamically
    const boundaryMatch = mimeBody.match(/(------=_NextPart_[^\n]*)/);
    const boundary = boundaryMatch ? boundaryMatch[0] : null;

    if (!boundary) {
        console.warn("MIME boundary not found.");
        return '';
    }

    // Try to extract text/plain content first
    const textRegex = new RegExp(`Content-Type:\\s*text/plain[\\s\\S]*?\\n\\n([\\s\\S]*?)(?:\\n\\n${boundary}|$)`, 'i');
    let match = mimeBody.match(textRegex);

    if (match && match[1]) {
        return match[1]
            .replace(/=\r\n/g, '') // Handle soft line breaks from quoted-printable
            .replace(/=\n/g, '')
            .replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16))) // Decode quoted-printable
            .replace(/\r\n/g, ' ')
            .replace(/\n/g, ' ')
            .trim();
    }

    // If no plain text found, extract HTML and convert to plain text
    const htmlRegex = new RegExp(`Content-Type:\\s*text/html[\\s\\S]*?\\n\\n([\\s\\S]*?)(?:\\n\\n${boundary}|$)`, 'i');
    match = mimeBody.match(htmlRegex);

    if (match && match[1]) {
        const htmlContent = match[1]
            .replace(/=\r\n/g, '') // Handle soft line breaks
            .replace(/=\n/g, '')
            .replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16))); // Decode quoted-printable

        const $ = cheerio.load(htmlContent);
        return $('body').text().replace(/\s+/g, ' ').trim(); // Convert HTML to plain text
    }

    return '';
};

const markEmailAsRead = async (email: string, password: string, host: string, emailDate: string) => {
    try {
        const config = {
            imap: {
                user: email,
                password: password,
                host: host,
                port: 993,
                tls: true,
                tlsOptions: { rejectUnauthorized: false },
                authTimeout: 10000,
            },
        };

        const connection = await imaps.connect(config);
        await connection.openBox("INBOX");

        // Search for the email based on date (or subject if needed)
        const searchCriteria = [["ON", emailDate]]; 

        const messages = await connection.search(searchCriteria, { bodies: [], struct: true });

        if (messages.length > 0) {
            await Promise.all(
                messages.map(msg => 
                    connection.addFlags(msg.attributes.uid, ["\\Seen"])
                )
            );
            

            console.log(`Marked ${messages.length} email(s) as read.`);
        } else {
            console.log("No matching email found to mark as read.");
        }

        await connection.end();
    } catch (error) {
        console.error("Error marking email as read:", error);
    }
};

export const getAllEmails = async (email: string, password: string, host: string) => {
    try {
        const config = {
            imap: {
                user: email,
                password: password,
                host,
                port: 993,
                tls: true,
                tlsOptions: { rejectUnauthorized: false },
                authTimeout: 5000, // Reduced timeout
            },
        };

        // Connect to IMAP server
        const connection = await imaps.connect(config);
        
        // Open the INBOX folder only
        await connection.openBox("INBOX"); // `true` means read-only mode

        // ✅ Fetch only the latest unread emails in INBOX
        const searchCriteria = ["ALL"]; // Modify this to "ALL" to get all emails
        const fetchOptions = { bodies: ["HEADER.FIELDS (FROM SUBJECT DATE)"], struct: true };

        const messages = await connection.search(searchCriteria, fetchOptions);

        // ✅ Limit processing to a maximum of 20 emails (adjust based on your needs)
        const selectedMessages = messages.slice(0, 20);

        // ✅ Fetch full email text only if necessary
        const emailDetails = await Promise.all(
            selectedMessages.map(async (message) => {
                try {
                    const headerPart = message.parts.find(part => part.which === "HEADER.FIELDS (FROM SUBJECT DATE)");
                    if (!headerPart) return null;

                    const header = headerPart.body || {};

                    return {
                        from: header.from?.[0] || "Unknown",
                        subject: header.subject?.[0] || "No Subject",
                        date: header.date?.[0] || "Unknown",
                    };
                } catch (error) {
                    console.error("Error parsing email:", error);
                    return null;
                }
            })
        );

        // Close the connection
        await connection.end();

        return emailDetails.filter(email => email !== null);

    } catch (error) {
        console.error("Error fetching emails:", error);
        return [];
    }
};