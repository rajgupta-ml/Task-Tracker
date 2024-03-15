
import { PoolClient } from "pg";
import { taskDataInterface } from "../interfaces/taskDataInterface.js";
import { priorityCheckerPersistance, taskCreationPersistance } from "../persistance/taskPersistance.js";

export const taskCreationInteractor = async (task_data : taskDataInterface, client : PoolClient) : Promise<number> => {
    // Task creation Database

    try {
        // ---CHECK THE PRIORITY 
        task_data.priority = priorityCheckerPersistance(task_data.task_due_date);
        const task_id : number = await taskCreationPersistance(task_data, client);
        return task_id
    } catch (error) {
        // Check the type of error and handle accordingly
        throw error
    }
}