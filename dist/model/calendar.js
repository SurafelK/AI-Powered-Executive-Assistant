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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarEventModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const CalendarEventSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    emailId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "UserAccount",
        required: true
    },
    title: { type: String, maxlength: 120 },
    description: {
        type: String
    },
    location: {
        type: String
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    timeZone: {
        type: String,
        default: "UTC"
    },
    reminders: [
        {
            timeBeforeEvent: {
                type: Number,
                default: 15 // In minutes
            },
            method: {
                type: String,
                enum: ["email", "push_notification"],
                default: "email"
            }
        }
    ],
    recurrence: {
        frequency: {
            type: String,
            enum: ["daily", "weekly", "monthly", "yearly", "none"],
            default: "none"
        },
        interval: {
            type: Number,
            default: 1
        }
    },
    attendees: [
        {
            email: { type: String },
            status: {
                type: String,
                enum: ["accepted", "declined", "tentative", "invited"],
                default: "invited"
            }
        }
    ],
    status: {
        type: String,
        enum: ["confirmed", "tentative", "cancelled"],
        default: "confirmed"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
const CalendarEvent = (0, mongoose_1.model)("CalendarEvent", CalendarEventSchema);
exports.CalendarEventModel = CalendarEvent;
