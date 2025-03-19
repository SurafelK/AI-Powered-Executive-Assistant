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
exports.emailLogin = exports.getProviderFromEmail = void 0;
const emailSupport_1 = require("../Email/emailSupport");
const imap_simple_1 = __importDefault(require("imap-simple"));
const emailSupport_2 = require("../Email/emailSupport");
const getProviderFromEmail = (email) => {
    if (!email.includes("@"))
        return null; // Validate email format
    return email.split("@")[1].split(".")[0]; // Extract the provider (before the first dot)
};
exports.getProviderFromEmail = getProviderFromEmail;
const emailLogin = (email, password, host, tls) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let provider = (0, emailSupport_2.getIMAPHost)(email, host); // First attempt with known provider
        let hostsToTry = provider ? [provider] : (0, emailSupport_1.getIMAPCOMPANY)(email, host);
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
                const connection = yield imap_simple_1.default.connect(config);
                if (connection) {
                    yield connection.end(); // Ensure proper logout
                    return imapHost;
                }
            }
            catch (error) {
                console.warn(`Failed to connect to IMAP host: ${imapHost}`, error);
            }
        }
        return false;
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("IMAP login failed:", error.message);
        }
        else {
            console.error("IMAP login failed:", error);
        }
        return false;
    }
});
exports.emailLogin = emailLogin;
