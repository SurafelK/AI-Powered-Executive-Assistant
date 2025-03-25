"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkingSettingRouter = void 0;
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const workingSettingController_1 = require("../controller/workingSettingController");
const router = express_1.default.Router();
exports.WorkingSettingRouter = router;
router.post('/add', authMiddleware_1.authMiddleware, workingSettingController_1.SaveWorkingHourSettings);
router.get('/get', authMiddleware_1.authMiddleware, workingSettingController_1.getWorkingHourSettings);
