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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const AuthRouter_1 = require("./routers/AuthRouter");
const db_1 = require("./Config/db");
const accountRouter_1 = require("./routers/accountRouter");
const node_cron_1 = __importDefault(require("node-cron"));
const emailSupport_1 = require("./Email/emailSupport");
const CalendarRouter_1 = require("./routers/CalendarRouter");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const PORT = 5000;
app.use('/api/auth', AuthRouter_1.AuthRouter);
app.use('/api/account', accountRouter_1.UserAccountRouter);
app.use('/api/calendar', CalendarRouter_1.CalendarRouter);
app.use((0, cookie_parser_1.default)()); // Use cookie-parser middleware
(0, db_1.dbConnect)();
// Schedule a job to run every 1 day
node_cron_1.default.schedule("0 0 * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Running email response job...");
    yield (0, emailSupport_1.respondAllEmail)();
    console.log("Email response job completed.");
}), {
    scheduled: true,
    timezone: "UTC" // Adjust the timezone if needed
});
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
