export interface taskDataInterface {
    user_id : number;
    task_title: string;
    task_description: string;
    task_due_date: string;
    priority? : number;
}

export interface taskUpdationInterface {
    task_id : number;
    status? : string;
    due_date?: string;
}

export interface filterInterface{
    user_id : number;
    priority?: string;
    due_date?: string;
    page?: string;
    limit?: string; 
}

export interface taskDeletionInterface {
    task_id: number;
}


export interface returnStatusResult {
    incomplete: number,
    complete: number,
}