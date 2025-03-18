import bcrypt from "bcryptjs";

export const saltHashPass = async (password: string): Promise<{ saltPass: string; hashPass: string }> => {
    try {
        const saltPass = await bcrypt.genSalt(10); // Await for salt generation
        const hashPass = await bcrypt.hash(password, saltPass); // Await for password hashing

        return { saltPass, hashPass };
    } catch (error) {
        console.error("Error hashing password:", error);
        throw new Error("Password hashing failed");
    }
};
