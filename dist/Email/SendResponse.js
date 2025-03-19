"use strict";
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
exports.createTransporter = exports.sendEmail = exports.getGeminiResponse = exports.getEmailWithSuggestion = void 0;
const generative_ai_1 = require("@google/generative-ai");
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const apiKey = process.env.GEMINI_API_KEY; // Replace with your actual API key
if (!apiKey) {
    console.error("GEMINI_API_KEY is not defined.");
    throw new Error("GEMINI_API_KEY is not defined.");
}
const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
const getEmailWithSuggestion = (subject, body, from, suggestion) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(body);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
        const prompt = `Subject: ${subject}\nBody from ${from}:\n ${body}\n\nPlease provide a professional response to the message above. which says ${suggestion}.`;
        const result = yield model.generateContent(prompt);
        if (!result || !result.response) {
            throw new Error("No response received from the model.");
        }
        const text = yield result.response.text();
        console.log(text);
        return text || "No response received.";
    }
    catch (error) {
        console.error("Gemini API error:", error);
        return "An error occurred while generating the response.";
    }
});
exports.getEmailWithSuggestion = getEmailWithSuggestion;
const getGeminiResponse = (subject, body, from) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(body);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
        const prompt = `Subject: ${subject}\nBody from ${from}:\n ${body}\n\nPlease provide a professional response to the message above. Keep it concise and structured in a formal email format.`;
        const result = yield model.generateContent(prompt);
        if (!result || !result.response) {
            throw new Error("No response received from the model.");
        }
        const text = yield result.response.text();
        console.log(text);
        return text || "No response received.";
    }
    catch (error) {
        console.error("Gemini API error:", error);
        return "An error occurred while generating the response.";
    }
});
exports.getGeminiResponse = getGeminiResponse;
// Function to determine SMTP settings based on email domain
const getSMTPPort = (host) => {
    const smtpPorts = {
        "smtp.gmail.com": [587, 465, 25],
        "smtp.office365.com": [587, 25],
        "smtp-mail.outlook.com": [587, 25],
        "smtp.live.com": [587, 25],
        "smtp.yahoo.com": [465, 587],
        "smtp.aol.com": [465, 587],
        "smtp.zoho.com": [587, 465],
        "smtp.mail.com": [465, 587],
        "smtp.fastmail.com": [465, 587],
        "smtp.sendgrid.net": [587, 25],
        "smtp.yandex.com": [465, 587],
        "smtp.protonmail.com": [465, 587],
    };
    return smtpPorts[host] || [587, 465, 25]; // Default ports if host not found
};
const sendEmail = (from, to, emailContent, host, pass) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { subject, body } = extractEmailParts(emailContent);
        const mailOptions = {
            from: from,
            to: to,
            subject: subject,
            text: body,
        };
        // Create transporter (No need to pass transporter as an argument)
        const transporter = (0, exports.createTransporter)(host, from, pass);
        if (!transporter)
            throw new Error("Failed to create transporter");
        const info = yield transporter.sendMail(mailOptions);
        console.log("Email sent:", info.response);
        return { success: true, response: info.response };
    }
    catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error: error };
    }
});
exports.sendEmail = sendEmail;
// Function to create a transporter
const createTransporter = (host, user, pass) => {
    try {
        const ports = getSMTPPort(host);
        const port = ports.includes(587) ? 587 : ports[0]; // Prefer 587, fallback to other ports
        const secure = port === 465; // SSL only for port 465
        const transporter = nodemailer_1.default.createTransport({
            host: host,
            port: port,
            secure: secure, // Secure mode based on port
            auth: {
                user: user,
                pass: pass,
            },
        });
        transporter.verify((error, success) => {
            if (error) {
                console.error("Transporter verification failed:", error);
            }
            else {
                console.log(`SMTP connected: ${host} on port ${port} (Secure: ${secure})`);
            }
        });
        return transporter;
    }
    catch (error) {
        console.error("Error creating transporter:", error);
        return null;
    }
};
exports.createTransporter = createTransporter;
// Extract subject and body using a regular expression
const extractEmailParts = (email) => {
    const match = email.match(/^Subject:\s*(.+)\n\n([\s\S]*)$/);
    if (match) {
        return {
            subject: match[1].trim(),
            body: match[2].trim(),
        };
    }
    return { subject: "", body: "" };
};
