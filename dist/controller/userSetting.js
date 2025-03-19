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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponses = exports.getSuggestion = exports.getAccountEmails = exports.getAllAccounts = exports.createUserAccount = void 0;
const SendResponse_1 = require("./../Email/SendResponse");
const EmailConfig_1 = require("../Config/EmailConfig");
const userAccounts_1 = require("../model/userAccounts");
const encryptDecrypt_1 = require("../Config/encryptDecrypt");
const emailSupport_1 = require("../Email/emailSupport");
const SendResponse_2 = require("../Email/SendResponse");
const createUserAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { email, password, respondAllEmail } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: "Please provide all required fields" });
        }
        const provider = yield (0, EmailConfig_1.getProviderFromEmail)(email);
        if (!provider) {
            res.status(400).json({ message: "Invalid email format" });
            return;
        }
        const tls = true;
        const checkPassword = yield (0, EmailConfig_1.emailLogin)(email, password, provider, tls);
        if (!checkPassword) {
            res.status(400).json({ message: "The provided email or password are incorrect" });
            return;
        }
        const encryptedPass = yield (0, encryptDecrypt_1.encrypt)(password);
        const newUserSettings = new userAccounts_1.UserAccountModel({
            email,
            password: encryptedPass.encrypted,
            provider,
            userId,
            respondAllEmail,
            hostname: checkPassword
        });
        const userAccount = yield newUserSettings.save();
        res.status(201).json({ message: "User account saved successfully", userAccount });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
        return;
    }
});
exports.createUserAccount = createUserAccount;
const getAllAccounts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.user.id;
        const emailAccounts = yield userAccounts_1.UserAccountModel.find({ userId: id });
        if (!emailAccounts) {
            res.status(400).json({ message: "No email account found" });
            return;
        }
        res.status(200).json({ emailAccounts });
        return;
    }
    catch (error) {
        console.error("Error fetching accounts:", error);
        res.status(500).json({ message: "Internal Server Error" });
        return;
    }
});
exports.getAllAccounts = getAllAccounts;
const getAccountEmails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.user.id;
        const { email } = req.body;
        const emailAccount = yield userAccounts_1.UserAccountModel.findOne({ email });
        console.log(emailAccount, id);
        if (!emailAccount || emailAccount.userId.toString() !== id) {
            res.status(400).json({ message: "This account doesn't belong to you" });
            return;
        }
        const decryptedPass = yield (0, encryptDecrypt_1.decrypt)(emailAccount.password);
        if (!(decryptedPass === null || decryptedPass === void 0 ? void 0 : decryptedPass.decrypted)) {
            res.status(500).json({ message: "Failed to decrypt password" });
            return;
        }
        const hostname = typeof emailAccount.hostname === 'string' ? emailAccount.hostname : ''; // Default to an empty string if not a string
        const allEmails = yield (0, emailSupport_1.getAllEmails)(emailAccount.email, decryptedPass.decrypted.toString(), hostname);
        res.status(200).json({ emails: allEmails });
        return;
    }
    catch (error) {
        console.error("Error fetching account emails:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
});
exports.getAccountEmails = getAccountEmails;
const getSuggestion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        // Then, assert it as SuggestionRequest
        const { idea, from: sender, body: messageBody, subject } = body;
        if (!idea) {
            throw new Error("Idea is required");
        }
        const response = yield (0, SendResponse_2.getEmailWithSuggestion)(subject, messageBody, sender, idea);
        console.log(response);
        res.status(200).json({ idea, response });
        return;
    }
    catch (error) {
        console.error("Error handling suggestion:", error);
        res.status(500).json({ message: "Internal Server Error" });
        return;
    }
});
exports.getSuggestion = getSuggestion;
const sendResponses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.user.id;
        const { to, body, email } = req.body;
        if (!to || !body || !email) {
            res.status(400).json({ message: "Please provide all required fields" });
        }
        const emailAccount = yield userAccounts_1.UserAccountModel.findOne({ email });
        if (!emailAccount || id !== (emailAccount === null || emailAccount === void 0 ? void 0 : emailAccount.userId.toString())) {
            res.status(400).json({ message: "This account doesn't belongs to you" });
            return;
        }
        const decryptedPass = yield (0, encryptDecrypt_1.decrypt)(emailAccount.password);
        const emailSend = yield (0, SendResponse_1.sendEmail)(emailAccount.email, to, body, emailAccount.hostname, decryptedPass.decrypted.toString());
        if (emailSend.success) {
            res.status(200).json({ message: "Email sent successfully" });
            return;
        }
        if (emailSend.error) {
            res.status(200).json({ message: "Email couldn't be sent" });
            return;
        }
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
        return;
    }
});
exports.sendResponses = sendResponses;
