"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true, minlength: 3, maxlength: 20 },
    password: { type: String, required: true, minlength: 6 },
    salt: { type: String, required: true, minlength: 3 },
    email: { type: String, required: true, minlength: 3, maxlength: 40, unique: true },
}, {
    toJSON: {
        transform: (_doc, ret) => {
            delete ret.password;
            delete ret.salt;
            delete ret.createdAt;
            delete ret.updatedAt;
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
    timestamps: true
});
const UserModel = (0, mongoose_1.model)("User", UserSchema);
exports.UserModel = UserModel;
