import { number } from "zod";
import { FrequencyMap, UserData } from "../interfaces/userDataDBInterface.js";

export const getFrequencyCountOfUserId = (data : Array<UserData>) : FrequencyMap => {
    const frequencyMap : FrequencyMap = {};


    data.map(item => {
        const user_id : number = item.user_id
        frequencyMap[user_id] = (frequencyMap[user_id] || 0) + 1;
    })

    const frequencyArray = Object.entries(frequencyMap);
    frequencyArray.sort((a, b) => b[1] - a[1]);
    const sortedFrequencyMap : FrequencyMap = Object.fromEntries(frequencyArray);
    return sortedFrequencyMap
}