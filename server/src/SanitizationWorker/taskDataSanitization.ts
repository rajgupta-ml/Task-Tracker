import { ZodError, z } from "zod";

import { taskDataInterface } from "../interfaces/taskDataInterface.js";

const taskDataSchema = z.object({
    user_id: z.number(),
    task_title: z.string(),
    task_description: z.string(),
    task_due_date: z.string(),
});


export const taskDataSanitization = (userDetails: taskDataInterface): taskDataInterface => {
    try {
        const requestBody: taskDataInterface = taskDataSchema.parse(userDetails);
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