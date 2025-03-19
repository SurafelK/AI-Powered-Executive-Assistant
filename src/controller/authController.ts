import { Request, Response } from 'express';
import { UserModel } from '../model/user';
import { comparePass, saltHashPass } from '../Config/auth';
import { ICreateUserInput, ILoginInput } from '../dto/user.dto';
import jwt from "jsonwebtoken"; // If using JWT for authentication
import { AuthRequest } from '../Config/express';

// Create Account

export const createUser = async (req:Request, res:Response) => {
    try {
        const {email, name, password} = <ICreateUserInput> req.body
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
        const { email, password } = <ILoginInput> req.body 

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
        const compare = await comparePass(
            user.salt,
            password,
            user.password
        )

        if(!compare){
            res.status(400).json("System is busy please try again later")
            return
        }

        // Generate JWT Token (optional, for authentication)
        const JWT_SECRET =  process.env.JWT_SECRET
        if(!JWT_SECRET){
            res.status(400).json({message:"Please provide JWT_SECRET"})
            return
        }
        const token = jwt.sign({ id: user._id },JWT_SECRET , { expiresIn: "1h" });

        res.status(200).json({ message: "Login successful", user, token });
        return
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getProfile = async (req:AuthRequest, res:Response) => {
    try {
        const user = req.user
        const userProfile = await UserModel.findById(user.id)
        if(!userProfile){
            res.status(400).json({message: "No user data available"})
            return
        }
        res.status(200).json({userProfile})
    } catch (error) {
        
    }
}