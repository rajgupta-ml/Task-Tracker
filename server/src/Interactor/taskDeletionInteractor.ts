import { PoolClient } from "pg";
import { taskDeletionInterface } from "../interfaces/taskDataInterface.js";
import { subTaskDeletionPersistance, taskDeletionPersistance } from "../persistance/taskPersistance.js";

export const taskDeletionInteractor = async (task_id : taskDeletionInterface, client: PoolClient) => {
    try {
        await taskDeletionPersistance(task_id, client);
        await subTaskDeletionPersistance(task_id,client,true);
    } catch (error) {
        throw error;
    }
}