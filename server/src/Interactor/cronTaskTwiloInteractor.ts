import { PoolClient } from "pg";
import { getUserIdWithPendingTaskPersistance } from "../persistance/getUserIdWithPendingTaskPersistance.js";
import { getFrequencyCountOfUserId } from "../persistance/getFrequencyCountOfUserId.js";
import { FrequencyMap } from "../interfaces/userDataDBInterface.js";
import { makeTwilioCallPersistence } from "../persistance/makeTwiloCallPersistance.js";
import { fetchPhoneNumbersByPriority } from "../persistance/fetchPhoneNumber.js";
import { updateUserPriority } from "../persistance/updateUserPriority.js";

export const cronTaskTwiloInteractor = async (client: PoolClient) => {
    // Fetch all the user_Id 

    try {
        const user_Id = await getUserIdWithPendingTaskPersistance(client)
        const frequencyCount : FrequencyMap = getFrequencyCountOfUserId(user_Id);
        await updateUserPriority(Object.keys(frequencyCount), client);
        const phoneNumbers : string[] = await fetchPhoneNumbersByPriority(client);
        phoneNumbers.map(async phoneNumber => {
            await makeTwilioCallPersistence(phoneNumber);
        })
    } catch (error) {
        throw error
    }
}