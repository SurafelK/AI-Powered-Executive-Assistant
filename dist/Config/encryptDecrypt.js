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
exports.decrypt = exports.encrypt = void 0;
const crypto_js_1 = __importDefault(require("crypto-js"));
const encrypt = (password) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ENCRYPTION_SECRET_KEY = process.env.ENCRYPTION_SECRET_KEY;
        if (!ENCRYPTION_SECRET_KEY) {
            return { encrypted: false };
        }
        const encrypted = crypto_js_1.default.AES.encrypt(password, ENCRYPTION_SECRET_KEY).toString();
        return { encrypted };
    }
    catch (error) {
        return { encrypted: false };
    }
});
exports.encrypt = encrypt;
const decrypt = (ciphertext) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ENCRYPTION_SECRET_KEY = process.env.ENCRYPTION_SECRET_KEY;
        if (!ENCRYPTION_SECRET_KEY) {
            return { decrypted: false };
        }
        const bytes = crypto_js_1.default.AES.decrypt(ciphertext, ENCRYPTION_SECRET_KEY);
        const decrypted = bytes.toString(crypto_js_1.default.enc.Utf8);
        return decrypted ? { decrypted } : { decrypted: false };
    }
    catch (error) {
        console.error("Decryption error:", error);
        return { decrypted: false };
    }
});
exports.decrypt = decrypt;
