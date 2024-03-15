
import { PoolClient } from "pg";
import { getFilterDataPersistance, taskUpdationOnDBPersistance } from "../persistance/taskPersistance.js";
import { filterInterface, taskUpdationInterface } from "../interfaces/taskDataInterface.js";

export const getFilterDataInteractor = async (filter_data : filterInterface, client : PoolClient) : Promise<object> => {
    // Task get the data from the Database 
    try {
        // ---CHECK THE PRIORITY 
       const data =  await getFilterDataPersistance(filter_data, client);
       return data
    } catch (error) {
        // Check the type of error and handle accordingly
        throw error
    }
}