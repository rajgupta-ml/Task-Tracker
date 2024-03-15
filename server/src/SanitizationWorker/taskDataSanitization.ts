import { ZodError, z } from "zod";

import { filterInterface, taskDataInterface, taskUpdationInterface } from "../interfaces/taskDataInterface.js";

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

const taskUpdationSchema = z.object({
    task_id: z.number(),
    status: z.string().optional(),
    due_date: z.string().optional(),
}).refine(data => {
    // Check if either status or due_date is present
    if (!data.status && !data.due_date) {
        throw new Error('Either status or due_date must be provided.');
    }
    return true;
}, {
    message: 'Either status or due_date must be provided.',
});




export const taskUpdationSanitization = (taskData: taskUpdationInterface): taskUpdationInterface => {
    try {
        const requestBody: taskUpdationInterface = taskUpdationSchema.parse(taskData);
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


const filterSchema = z.object({
    user_id: z.number(),
    priority: z.string().optional(),
    due_date: z.string().optional(),
    limit: z.string().optional(),
    page: z.string().optional(),
});

export const getFilterDataSanitization = (filterData: filterInterface): filterInterface => {
    try {
        const requestBody: filterInterface = filterSchema.parse(filterData);
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