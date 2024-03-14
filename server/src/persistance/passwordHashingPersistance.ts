export const passwordEncryptionPersistance = async (password: string, bcrypt: any): Promise<string> => {
    try {
        const hash = await bcrypt.hash(password, 12); 
        return hash;
    } catch (error) {
        console.error("Error occurred during password hashing:", error);
        throw new Error("Failed to hash the password");
    }
};
