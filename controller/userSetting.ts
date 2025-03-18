import { AuthRequest } from "../Config/express";
import { Response } from 'express';
import { IUserSettingInput } from "../dto/setting.dto";
import { emailLogin, getProviderFromEmail } from "../Config/EmailConfig";
import { UserAccountModel } from "../model/userAccounts";
import { encrypt } from "../Config/encryptDecrypt";

export const createUserAccount = async (req:AuthRequest, res:Response) => {
    try {
        const userId = req.user.id

        const { email, password, respondAllEmail } = <IUserSettingInput> req.body
        if(!email || !password ){
            res.status(400).json({message:"Please provide all required fields"})
        }
        const provider = await getProviderFromEmail(email)
        if(!provider){
            res.status(400).json({message:"Invalid email format"})
            return
        }
        const tls = true
        const checkPassword = await emailLogin(email,password, provider, tls)
        if(!checkPassword){
            res.status(400).json({message: "The provided email or password are incorrect"})
            return
        }

        const encryptedPass = await encrypt(password)

        const newUserSettings = new UserAccountModel({
            email,
            password: encryptedPass.encrypted,
            provider,
            userId,
            respondAllEmail,
            hostname: checkPassword
        })

        const userAccount = await newUserSettings.save()
        res.status(201).json({message: "User account saved successfully",userAccount})

    } catch (error) {
        res.status(500).json({message: "Internal server error"})
        return
    }
}