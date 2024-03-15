import { Jwt } from "jsonwebtoken";

export const jwtSignPersistance = (signData: string, jwt: any): string => {
    try {
        // Sign the JWT token
        const token = jwt.sign({
            data: signData,
        }, process.env.SECRET, { expiresIn: '1h' }); // Note the corrected spelling of 'secret' and 'expiresIn'
        return token; // Return the signed token
    } catch (error) {
        // If an error occurs during JWT signing, throw it
        console.error(error);
        throw new Error("Can Not create JWT token");
    }
}
