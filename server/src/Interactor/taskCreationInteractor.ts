
import { PoolClient } from "pg";
import { taskDataInterface, taskDeletionInterface } from "../interfaces/taskDataInterface.js";
import { istaskIdValidPersistance, priorityCheckerPersistance, subTaskCreationPersistance, taskCreationPersistance } from "../persistance/taskPersistance.js";

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


export const subTaskCreationInteractor = async (task_id : taskDeletionInterface, client : PoolClient) : Promise<number> => {
    // Creating Sub Task
    try {
        // Check if the task_id is valid or not.
        let isValid = await istaskIdValidPersistance(task_id, client);
        if(!isValid) throw new Error("Invalid Task Id");
        const sub_task_id : number = await subTaskCreationPersistance(task_id, client);
        return sub_task_id;
    } catch (error) {
        throw error
    }
}