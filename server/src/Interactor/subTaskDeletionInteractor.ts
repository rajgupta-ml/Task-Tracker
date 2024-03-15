import { PoolClient } from "pg";
import { taskDeletionInterface } from "../interfaces/taskDataInterface.js";
import { subTaskDeletionPersistance} from "../persistance/taskPersistance.js";

export const subTaskDeletionInteractor = async (task_id : taskDeletionInterface, client: PoolClient) => {
    try {
        await subTaskDeletionPersistance(task_id,client,false);
    } catch (error) {
        throw error;
    }
}