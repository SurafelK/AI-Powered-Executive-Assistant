"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRouter = void 0;
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controller/authController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
exports.AuthRouter = router;
router.post('/register', authController_1.createUser);
router.post('/login', authController_1.login);
router.get('/profile', authMiddleware_1.authMiddleware, authController_1.getProfile);
