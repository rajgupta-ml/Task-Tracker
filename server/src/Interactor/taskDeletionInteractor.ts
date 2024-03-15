import { PoolClient } from "pg";
import { taskDeletionInterface } from "../interfaces/taskDataInterface.js";
import { taskDeletionPersistance } from "../persistance/taskPersistance.js";

export const taskDeletionInteractor = async (task_id : taskDeletionInterface, client: PoolClient) => {
    try {
        await taskDeletionPersistance(task_id, client);
    } catch (error) {
        throw error;
    }
}