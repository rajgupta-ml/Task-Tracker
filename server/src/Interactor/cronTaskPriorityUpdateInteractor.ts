import { PoolClient } from "pg";
import { cronTaskPriorityUpdatePersistance } from "../persistance/cronTaskPersistance.js";

export const cronTaskPriorityUpdateInteractor = async(client : PoolClient ) => {
    try {
        // calling the database layer
        await cronTaskPriorityUpdatePersistance(client);
    } catch (error) {
        throw error
    }
}