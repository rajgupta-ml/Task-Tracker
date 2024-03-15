import { returnStatusResult } from "../interfaces/taskDataInterface.js";

export const getStatusString = (num: returnStatusResult): string =>{
    const complete : number= num.complete;
    const incomplete : number = num.incomplete; 

    const totalTask = complete + incomplete;
    let statusString = "TODO"
    if(complete == totalTask) statusString = "DONE"
    else if(complete >= 1) statusString = "IN_PROGRESS"
    return statusString;
}