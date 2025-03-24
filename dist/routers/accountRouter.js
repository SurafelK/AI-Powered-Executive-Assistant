"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAccountRouter = void 0;
const express_1 = __importDefault(require("express"));
const userAccounts_1 = require("../controller/userAccounts");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
exports.UserAccountRouter = router;
router.post('/add', authMiddleware_1.authMiddleware, userAccounts_1.createUserAccount);
router.get('/acc-emails', authMiddleware_1.authMiddleware, userAccounts_1.getAccountEmails);
router.post('/get-suggestion', authMiddleware_1.authMiddleware, userAccounts_1.getSuggestion);
router.get('/all-accounts', authMiddleware_1.authMiddleware, userAccounts_1.getAllAccounts);
router.post('/send', authMiddleware_1.authMiddleware, userAccounts_1.sendResponses);
