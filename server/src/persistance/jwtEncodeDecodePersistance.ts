import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
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




export const jwtDecodePersistance = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token: string = req.cookies["jwt"];
        if (!token) throw new Error("Unauthorized");
        if (process.env.SECRET === undefined) throw new Error("SECRET environment variable is not set");
        const secret : string  = process.env.SECRET;
        jwt.verify(token, secret);
        // Proceed to the next middleware
        next();
    } catch (error) {
        // Handle error if token is invalid or not provided
         (res as any).error("Unauthorized", 401);
    }
};
