import { Request, Response } from 'express';
import { UserModel } from '../model/user';
import { comparePass, saltHashPass } from '../Config/auth';
import { ICreateUserInput, ILoginInput } from '../dto/user.dto';
import jwt from "jsonwebtoken"; // If using JWT for authentication
import { AuthRequest } from '../Config/express';

// Create Account

export const createUser = async (req:Request, res:Response) => {
    try {
        const {email, name, password, } = <ICreateUserInput> req.body
        console.log(email,name,password)
        if(!email || !name || !password ){
            res.status(400).json({message: "Please fill all required fields"})
            return
        }

        const user = await UserModel.findOne({email})
        if(user)
        {
            res.status(400).json({message: "You have account previously"})
            return
        }

        if (password.length < 6) {
            res.status(400).json({ message: "Password must be at least 6 characters" });
            return
        }

        if(name.length < 3  || name.length > 20){
            res.status(400).json({message: "Name must be between 3 and 20 characters"})
            return
        }

        const {saltPass, hashPass} = await saltHashPass(password)

        if(!saltPass || !hashPass){
            res.status(500).json({message: "Internal server error"})
            return
        }

        const newUser = new UserModel({
            email,
            name,
            password: hashPass,
            salt: saltPass
        })
        await newUser.save()
        res.status(200).json({message: "Successfully created account", newUser})
        return
    } catch (error) {
        res.status(500).json({message: `Internal server error ${error}`})
        return
    }
}
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = <ILoginInput>req.body;

        // Check if email and password are provided
        if (!email || !password) {
            res.status(400).json({ message: "Please fill all required fields" });
            return
        }

        // Find the user by email
        const user = await UserModel.findOne({ email });

        if (!user) {
            res.status(401).json({ message: "Invalid credentials" });
            return
        }

        // Compare the entered password with the stored hashed password
        const compare = await comparePass(user.salt, password, user.password);

        if (!compare) {
            res.status(401).json({ message: "Invalid credentials" });
            return
        }

        // Ensure JWT_SECRET is set
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            res.status(500).json({ message: "Server configuration error" });
            return
        }

        // Generate JWT Token
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

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
        return
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal Server Error" });
        return
    }
};

export const getProfile = async (req:AuthRequest, res:Response) => {
    try {
        const user = req.user
        const userProfile = await UserModel.findById(user.id)
        if(!userProfile){
            res.status(400).json({isLoggedIn:false, message: "No user data available"})
            return
        }
        res.status(200).json({isLoggedIn:true, userProfile})
    } catch (error) {
        res.status(500).json({message: "Internal server error"})
        return
    }
}

export const isLoggedIn = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ isLoggedIn: false, message: "Unauthorized" });
            return
        }

        const userProfile = await UserModel.findById(req.user.id);
        if (!userProfile) {
            res.status(400).json({ isLoggedIn: false, message: "No user data available" });
            return
        }

        res.status(200).json({ isLoggedIn: true, userProfile });
        return
    } catch (error) {
        console.error("Error in isLoggedIn:", error);
        res.status(500).json({ message: "Internal server error" });
        return
    }
};

export const logout = (req: Request, res: Response) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) return res.status(400).json({ message: "No token provided" });

    // Clear the cookie and expire it immediately
    res.cookie("token", "", { expires: new Date(0), httpOnly: true, secure: true });

    return res.json({ message: "Logged out successfully" });
};
