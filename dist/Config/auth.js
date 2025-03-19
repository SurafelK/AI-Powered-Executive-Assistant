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
exports.comparePass = exports.saltHashPass = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const saltHashPass = (password) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const saltPass = yield bcryptjs_1.default.genSalt(10); // Await for salt generation
        const hashPass = yield bcryptjs_1.default.hash(password, saltPass); // Await for password hashing
        return { saltPass, hashPass };
    }
    catch (error) {
        throw new Error("Password hashing failed");
    }
});
exports.saltHashPass = saltHashPass;
const comparePass = (salt, password, hashedPass) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hashpass = yield bcryptjs_1.default.hash(password, salt);
        if (hashedPass === hashpass) {
            return true;
        }
        return false;
    }
    catch (error) {
        return false;
    }
});
exports.comparePass = comparePass;
