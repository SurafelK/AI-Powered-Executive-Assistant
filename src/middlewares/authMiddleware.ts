import jwt  from 'jsonwebtoken';
import { Request, Response, NextFunction } from "express";
import { AuthRequest } from '../Config/express';

export const authMiddleware = async (req:AuthRequest, res:Response, next:NextFunction) =>{
    try {
        const token = req.header('Authorization')?.split(' ')[1]; 
        if(!token){
            res.status(400).json({message: "No token provided"})
            return
        }
        const JWT_SECRET =  process.env.JWT_SECRET

        if (!JWT_SECRET) {
            res.status(500).json({ message: "JWT secret is not defined" });
            return
        }
        const decoded = await jwt.verify(token, JWT_SECRET)
        if(!decoded){
            res.status(403).json({message: "Invalid token"})
            return
        }
        req.user = decoded
        next()
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token" });
        return
    }
}