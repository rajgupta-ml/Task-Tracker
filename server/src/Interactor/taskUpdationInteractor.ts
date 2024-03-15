
import { PoolClient } from "pg";
import { taskUpdationOnDBPersistance } from "../persistance/taskPersistance.js";
import { taskUpdationInterface } from "../interfaces/taskDataInterface.js";

export const taskUpdationInteractor = async (task_data : taskUpdationInterface, client : PoolClient) : Promise<void> => {
    // Task creation Database

    try {
        await taskUpdationOnDBPersistance(task_data, client);
    } catch (error) {
        // Check the type of error and handle accordingly
        throw error
    }
}