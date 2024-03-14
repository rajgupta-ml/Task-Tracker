import { ZodError, z } from "zod";
import { userRegistrationInterface } from "../interfaces/userRegistrationInterface.js";

const registrationSchema = z.object({
    userPhoneNumber: z.string().min(1),
    userPassword: z.string().min(8),
});


export const userRegistrationDataSanitization = (userDetails: object) => {
    try {
        const requestBody: userRegistrationInterface = registrationSchema.parse(userDetails);
        return requestBody;
    } catch (error) {
        if (error instanceof ZodError) {
            // Throw a custom error with a status code
            const errorMessage = error.errors.map(err => err.message).join(', ');
            const validationError = new Error(`Invalid request body: ${errorMessage}`);
            (validationError as any).status_code = 400;
            throw validationError;
        } else {
            throw new Error("Unexpected error occurred during data validation");
        }
    }

}