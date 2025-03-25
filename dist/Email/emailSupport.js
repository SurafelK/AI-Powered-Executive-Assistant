"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllEmails = exports.extractEmailBody = exports.getIMAPCOMPANY = exports.getIMAPHost = exports.respondAllEmail = void 0;
const encryptDecrypt_1 = require("../Config/encryptDecrypt");
const userAccounts_1 = require("../model/userAccounts");
const imap_simple_1 = __importDefault(require("imap-simple"));
const mailparser_1 = require("mailparser");
const SendResponse_1 = require("./SendResponse");
const cheerio = __importStar(require("cheerio"));
const respondAllEmail = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const respondToEmails = yield userAccounts_1.UserAccountModel.find({ respondAllEmail: true });
        for (const emailData of respondToEmails) {
            const decryptedPass = yield (0, encryptDecrypt_1.decrypt)(emailData.password);
            if (!decryptedPass || !decryptedPass.decrypted) {
                console.error(`Failed to decrypt password for ${emailData.email}`);
                continue;
            }
            const password = decryptedPass.decrypted.toString();
            const unreadEmails = yield getUnreadEmails(emailData.email, password, emailData.hostname // Ensure this is always a string
            );
            console.log(`Unread emails for  ${emailData.email}:`, unreadEmails);
            for (let i = 0; i < unreadEmails.length; i++) {
                const response = yield (0, SendResponse_1.getGeminiResponse)(unreadEmails[i].subject, unreadEmails[i].body, unreadEmails[i].from);
                console.log(unreadEmails);
                const sendResponse = yield (0, SendResponse_1.sendEmail)(emailData.email, unreadEmails[i].from, response, emailData.hostname, password);
                if (sendResponse.success) {
                    console.log("Sent Successfully");
                    yield markEmailAsRead(emailData.email, password, emailData.hostname, unreadEmails[i].date);
                }
                if (sendResponse.error) {
                    console.log("Not Sent");
                }
            }
        }
    }
    catch (error) {
        console.error("Error in respondAllEmail:", error);
    }
});
exports.respondAllEmail = respondAllEmail;
const getUnreadEmails = (email, password, host) => __awaiter(void 0, void 0, void 0, function* () {
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
        const connection = yield imap_simple_1.default.connect(config);
        yield connection.openBox("INBOX");
        // Search for unread emails
        const searchCriteria = ["UNSEEN"];
        const fetchOptions = {
            bodies: ["HEADER", "TEXT"],
            struct: true,
        };
        const messages = yield connection.search(searchCriteria, fetchOptions);
        const unreadEmails = yield Promise.all(messages.map((message) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c, _d;
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
                const parsedEmail = yield (0, mailparser_1.simpleParser)(textBody);
                // Extract plain text body, falling back to cleaned HTML if necessary
                let emailBody = ((_a = parsedEmail.text) === null || _a === void 0 ? void 0 : _a.trim()) || "";
                if (!emailBody && parsedEmail.html) {
                    emailBody = parsedEmail.html.replace(/<\/?[^>]+(>|$)/g, ""); // Remove HTML tags
                }
                const cleanBody = yield extractPlainText(emailBody);
                return {
                    from: ((_b = header.from) === null || _b === void 0 ? void 0 : _b[0]) || "Unknown",
                    subject: ((_c = header.subject) === null || _c === void 0 ? void 0 : _c[0]) || "No Subject",
                    date: ((_d = header.date) === null || _d === void 0 ? void 0 : _d[0]) || "Unknown",
                    body: cleanBody || "No Content",
                };
            }
            catch (error) {
                console.error("Error parsing email:", error);
                return null;
            }
        })));
        // Remove null values from results
        const filteredEmails = unreadEmails.filter(email => email !== null);
        // Close the connection
        yield connection.end();
        return filteredEmails;
    }
    catch (error) {
        console.error("Error fetching unread emails:", error);
        return [];
    }
});
// Function to map email providers to IMAP hosts
const getIMAPHost = (email, provider) => {
    const defaultProviders = {
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
exports.getIMAPHost = getIMAPHost;
// Function to generate multiple possible IMAP hosts for company email
const getIMAPCOMPANY = (email, provider) => {
    try {
        const domain = email.split("@")[1]; // Extract domain from email
        if (!domain)
            return [];
        return [
            `imap.${domain}`,
            `mail.${domain}`,
            `email.${domain}`,
            `webmail.${domain}`,
        ]; // All possible host formats
    }
    catch (error) {
        console.error("Error generating IMAP hosts:", error);
        return [];
    }
};
exports.getIMAPCOMPANY = getIMAPCOMPANY;
const extractEmailBody = (mimeBody) => {
    // Decode quoted-printable encoding
    const decodeQuotedPrintable = (text) => text
        .replace(/=\r\n/g, '') // Remove soft line breaks
        .replace(/=\n/g, '')
        .replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16))); // Decode hex chars
    // Extract HTML content from MIME
    const htmlMatch = mimeBody.match(/Content-Type:\s*text\/html[\s\S]*?\n\n([\s\S]*?)(?:\n\n------|$)/i);
    if (!htmlMatch || !htmlMatch[1])
        return 'No Content';
    // Decode HTML content and parse with Cheerio
    const decodedHtml = decodeQuotedPrintable(htmlMatch[1]);
    const $ = cheerio.load(decodedHtml);
    return $('body').text().replace(/\s+/g, ' ').trim(); // Extract and clean text
};
exports.extractEmailBody = extractEmailBody;
const extractPlainText = (mimeBody) => {
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
const markEmailAsRead = (email, password, host, emailDate) => __awaiter(void 0, void 0, void 0, function* () {
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
        const connection = yield imap_simple_1.default.connect(config);
        yield connection.openBox("INBOX");
        // Search for the email based on date (or subject if needed)
        const searchCriteria = [["ON", emailDate]];
        const messages = yield connection.search(searchCriteria, { bodies: [], struct: true });
        if (messages.length > 0) {
            yield Promise.all(messages.map(msg => connection.addFlags(msg.attributes.uid, ["\\Seen"])));
            console.log(`Marked ${messages.length} email(s) as read.`);
        }
        else {
            console.log("No matching email found to mark as read.");
        }
        yield connection.end();
    }
    catch (error) {
        console.error("Error marking email as read:", error);
    }
});
const getAllEmails = (email, password, host) => __awaiter(void 0, void 0, void 0, function* () {
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
        const connection = yield imap_simple_1.default.connect(config);
        // Open the INBOX folder only
        yield connection.openBox("INBOX"); // `true` means read-only mode
        // ✅ Fetch only the latest unread emails in INBOX
        const searchCriteria = ["ALL"]; // Modify this to "ALL" to get all emails
        const fetchOptions = { bodies: ["HEADER.FIELDS (FROM SUBJECT DATE)"], struct: true };
        const messages = yield connection.search(searchCriteria, fetchOptions);
        // ✅ Limit processing to a maximum of 20 emails (adjust based on your needs)
        const selectedMessages = messages.slice(0, 100);
        // ✅ Fetch full email text only if necessary
        const emailDetails = yield Promise.all(selectedMessages.map((message) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const headerPart = message.parts.find(part => part.which === "HEADER.FIELDS (FROM SUBJECT DATE)");
                if (!headerPart)
                    return null;
                const header = headerPart.body || {};
                return {
                    from: ((_a = header.from) === null || _a === void 0 ? void 0 : _a[0]) || "Unknown",
                    subject: ((_b = header.subject) === null || _b === void 0 ? void 0 : _b[0]) || "No Subject",
                    date: ((_c = header.date) === null || _c === void 0 ? void 0 : _c[0]) || "Unknown",
                };
            }
            catch (error) {
                console.error("Error parsing email:", error);
                return null;
            }
        })));
        // Close the connection
        yield connection.end();
        return emailDetails.filter(email => email !== null);
    }
    catch (error) {
        console.error("Error fetching emails:", error);
        return [];
    }
});
exports.getAllEmails = getAllEmails;
