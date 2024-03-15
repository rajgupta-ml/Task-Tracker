import { PoolClient } from "pg";
import { returnStatusResult, taskDeletionInterface } from "../interfaces/taskDataInterface.js";
import { getSubTaskWithSameTaskId, subTaskUpdationPersistance, taskUpdationOnDBPersistance } from "../persistance/taskPersistance.js";
import { getStatusString } from "../persistance/getStatusString.js";

export const subTaskUpdationInteractor = async (data: taskDeletionInterface, client : PoolClient) => {



    try {
        // Update the status of subTask table
        const task_id : number = await subTaskUpdationPersistance(data, client);
        // Using the task_id select all the sub-task 
        const numberOfStatus : returnStatusResult = await getSubTaskWithSameTaskId({task_id}, client);
        const statusString : string = getStatusString(numberOfStatus);
        await taskUpdationOnDBPersistance({task_id, status : statusString}, client);
    } catch (error) {
        throw error
    }
}