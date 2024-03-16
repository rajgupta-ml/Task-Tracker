
import { PoolClient } from "pg";
import { getFilterDataPersistance, getFilteredSubTaskPersistance, taskUpdationOnDBPersistance } from "../persistance/taskPersistance.js";
import { filterInterface, taskDeletionInterface, taskUpdationInterface } from "../interfaces/taskDataInterface.js";

export const getFilteredSubTaskInteractor = async (task_id : taskDeletionInterface, client : PoolClient) : Promise<object> => {
    // Task get the data from the Database 
    try {
        // ---CHECK THE PRIORITY 
       const data =  await getFilteredSubTaskPersistance(task_id, client);
       return data
    } catch (error) {
        // Check the type of error and handle accordingly
        throw error
    }
}