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
exports.logout = exports.isLoggedIn = exports.getProfile = exports.login = exports.createUser = void 0;
const user_1 = require("../model/user");
const auth_1 = require("../Config/auth");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken")); // If using JWT for authentication
// Create Account
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, name, password, } = req.body;
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
        if (password.length < 6) {
            res.status(400).json({ message: "Password must be at least 6 characters" });
            return;
        }
        if (name.length < 3 || name.length > 20) {
            res.status(400).json({ message: "Name must be between 3 and 20 characters" });
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
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        // Ensure JWT_SECRET is set
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            res.status(500).json({ message: "Server configuration error" });
            return;
        }
        // Generate JWT Token
        const token = jsonwebtoken_1.default.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600000, // 1 hour
        });
        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
            },
            token,
        });
        return;
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal Server Error" });
        return;
    }
});
exports.login = login;
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const userProfile = yield user_1.UserModel.findById(user.id);
        if (!userProfile) {
            res.status(400).json({ isLoggedIn: false, message: "No user data available" });
            return;
        }
        res.status(200).json({ isLoggedIn: true, userProfile });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
        return;
    }
});
exports.getProfile = getProfile;
const isLoggedIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ isLoggedIn: false, message: "Unauthorized" });
            return;
        }
        const userProfile = yield user_1.UserModel.findById(req.user.id);
        if (!userProfile) {
            res.status(400).json({ isLoggedIn: false, message: "No user data available" });
            return;
        }
        res.status(200).json({ isLoggedIn: true, userProfile });
        return;
    }
    catch (error) {
        console.error("Error in isLoggedIn:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
});
exports.isLoggedIn = isLoggedIn;
const logout = (req, res) => {
    var _a;
    const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token)
        return res.status(400).json({ message: "No token provided" });
    // Clear the cookie and expire it immediately
    res.cookie("token", "", { expires: new Date(0), httpOnly: true, secure: true });
    return res.json({ message: "Logged out successfully" });
};
exports.logout = logout;
