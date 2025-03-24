import { sendEmail } from '../Email/SendResponse';
import { AuthRequest } from "../Config/express";
import { Response } from 'express';
import { IgetAccountEmails, IUserSettingInput, sendEmailInput, SuggestionRequest } from "../dto/account.dto";
import { emailLogin, getProviderFromEmail } from "../Config/EmailConfig";
import { UserAccountModel } from "../model/userAccounts";
import { decrypt, encrypt } from "../Config/encryptDecrypt";
import { getAllEmails } from "../Email/emailSupport";
import { getEmailWithSuggestion } from "../Email/SendResponse";

export const createUserAccount = async (req:AuthRequest, res:Response) => {
    try {
        const userId = req.user.id

        const { email, password, respondAllEmail, preferenceResponse} = <IUserSettingInput> req.body
        if(!email || !password ){
            res.status(400).json({message:"Please provide all required fields"})
        }
        if (preferenceResponse && preferenceResponse.length > 100) {
            res.status(400).json({message: "Preference response if has to be less than 100 characters"})
            return
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
            hostname: checkPassword,
            preferenceResponse
        })

        const userAccount = await newUserSettings.save()
        res.status(201).json({message: "User account saved successfully",userAccount})

    } catch (error) {
        res.status(500).json({message: "Internal server error"})
        return
    }
}  
export const getAllAccounts = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.user.id;

        const emailAccounts = await UserAccountModel.find({ userId: id });

        if (emailAccounts.length === 0) {
            res.status(400).json({ message: "No email account found" });
            return;
        }

        const allAccountsEmail = await Promise.all(
            emailAccounts.map(async ({ email, password, hostname }) => {
                const decPassword = await decrypt(password);
                const allEmails = await getAllEmails(email, decPassword.decrypted.toString(), hostname);
                return { [email]: allEmails }; // Use email as the key
            })
        );

        res.status(200).json({ accounts: allAccountsEmail });
        return;
    } catch (error) {
        console.error("Error fetching accounts:", error);
        res.status(500).json({ message: "Internal Server Error" });
        return;
    }
};


export const getAccountEmails = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.user.id;
        const { email } = <IgetAccountEmails> req.params; 
        
        const emailAccount = await UserAccountModel.findOne({ email });
        console.log(emailAccount, id)
  
        if (!emailAccount || emailAccount.userId.toString() !== id) {
            res.status(400).json({ message: "This account doesn't belong to you" });
            return
        }

        const decryptedPass = await decrypt(emailAccount.password);
        if (!decryptedPass?.decrypted) {
            res.status(500).json({ message: "Failed to decrypt password" });
            return
        }

        
        const hostname = typeof emailAccount.hostname === 'string' ? emailAccount.hostname : ''; // Default to an empty string if not a string
        const allEmails = await getAllEmails(
            emailAccount.email,
            decryptedPass.decrypted.toString(),
            hostname 
        );

        res.status(200).json({ emails: allEmails });
        return

    } catch (error) {
        console.error("Error fetching account emails:", error);
        res.status(500).json({ message: "Internal server error" });
        return
    }
};

export const getSuggestion = async (req: AuthRequest, res: Response) => {
    try {

        const body = req.body as unknown;

        // Then, assert it as SuggestionRequest
        const { idea, from: sender, body: messageBody, subject } = body as SuggestionRequest;

        if (!idea) {
            throw new Error("Idea is required");
        }

        const response = await getEmailWithSuggestion(subject, messageBody, sender, idea);
        console.log(response)
        res.status(200).json({ idea, response });
        return

    } catch (error) {
        console.error("Error handling suggestion:", error);
        res.status(500).json({ message: "Internal Server Error" });
        return
    }
};

export const sendResponses = async (req:AuthRequest, res:Response) => {
    try {
        const id = req.user.id
        const {to, body, email} = <sendEmailInput> req.body
        if(!to  || !body || !email){
            res.status(400).json({message:"Please provide all required fields"})
        }
        const emailAccount = await UserAccountModel.findOne({ email });

        if( !emailAccount || id !== emailAccount?.userId.toString() ){
            res.status(400).json({message: "This account doesn't belongs to you"})
            return
        }

        const decryptedPass = await decrypt(emailAccount.password)

        const emailSend = await sendEmail(emailAccount.email, to,body, emailAccount.hostname,decryptedPass.decrypted.toString()  )

        if(emailSend.success){
            res.status(200).json({message:"Email sent successfully"})
            return
        }
        if(emailSend.error){
            res.status(200).json({message:"Email couldn't be sent"})
            return
        }

    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        return
    }
}