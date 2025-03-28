import bcrypt from "bcryptjs";

export const saltHashPass = async (password: string): Promise<{ saltPass: string; hashPass: string }> => {
    try {
        const saltPass = await bcrypt.genSalt(10); // Await for salt generation
        const hashPass = await bcrypt.hash(password, saltPass); // Await for password hashing

        return { saltPass, hashPass };
    } catch (error) {
        
        throw new Error("Password hashing failed");
    }
};

export const comparePass = async (salt:string, password:string, hashedPass:string) : Promise <Boolean> =>{
    try {
        const hashpass = await bcrypt.hash(password, salt)
        if( hashedPass === hashpass  ){
            return true
        }

        return false
    } catch (error) {
        return false
    }
}