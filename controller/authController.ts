import { Request, Response } from 'express';
import { UserModel } from '../model/user';
import { saltHashPass } from '../Config/auth';
import { ICreateUserInput } from '../dto/user.dto';
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