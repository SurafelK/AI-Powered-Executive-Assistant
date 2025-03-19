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
exports.getProfile = exports.login = exports.createUser = void 0;
const user_1 = require("../model/user");
const auth_1 = require("../Config/auth");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken")); // If using JWT for authentication
// Create Account
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, name, password } = req.body;
        console.log(email, name, password);
        if (!email || !name || !password) {
            res.status(400).json({ message: "Please fill all required fields" });
            return;
        }
        const user = yield user_1.UserModel.findOne({ email });
        if (user) {
            res.status(400).json({ message: "You have account previously" });
            return;
        }
        const { saltPass, hashPass } = yield (0, auth_1.saltHashPass)(password);
        if (!saltPass || !hashPass) {
            res.status(500).json({ message: "Internal server error" });
            return;
        }
        const newUser = new user_1.UserModel({
            email,
            name,
            password: hashPass,
            salt: saltPass
        });
        yield newUser.save();
        res.status(200).json({ message: "Successfully created account", newUser });
        return;
    }
    catch (error) {
        res.status(500).json({ message: `Internal server error ${error}` });
        return;
    }
});
exports.createUser = createUser;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Check if email and password are provided
        if (!email || !password) {
            res.status(400).json({ message: "Please fill all required fields" });
            return;
        }
        // Find the user by email
        const user = yield user_1.UserModel.findOne({ email });
        if (!user) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        // Compare the entered password with the stored hashed password
        const compare = yield (0, auth_1.comparePass)(user.salt, password, user.password);
        if (!compare) {
            res.status(400).json("System is busy please try again later");
            return;
        }
        // Generate JWT Token (optional, for authentication)
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            res.status(400).json({ message: "Please provide JWT_SECRET" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({ message: "Login successful", user, token });
        return;
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.login = login;
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const userProfile = yield user_1.UserModel.findById(user.id);
        if (!userProfile) {
            res.status(400).json({ message: "No user data available" });
            return;
        }
        res.status(200).json({ userProfile });
    }
    catch (error) {
    }
});
exports.getProfile = getProfile;
