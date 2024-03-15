import { PoolClient } from "pg";
import { taskDataInterface } from "../interfaces/taskDataInterface.js";

export const taskCreationPersistance  = async (task_data : taskDataInterface, client: PoolClient) : Promise<number> => {
    const tableCreation : string = `CREATE TABLE IF NOT EXISTS task (
    task_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    task_title VARCHAR(255) NOT NULL,
    task_description TEXT NOT NULL,
    task_due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'TODO',
    priority INT NOT NULL,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "users"(user_id)
    );
    `

    const insertQuery : string= `
      INSERT INTO task (user_id, task_title, task_description, task_due_date, priority) 
      VALUES ($1, $2, $3, $4, $5)
      RETURNING task_id`;



    try {
        await client.query('BEGIN');
        await client.query(tableCreation);
        const {rows} = await client.query(insertQuery, [task_data.user_id, task_data.task_title, task_data.task_description, task_data.task_due_date, task_data.priority]);
        const task_id : number = rows[0].task_id;
        await client.query('COMMIT');
        client.release();
        return task_id;
    } catch (error) {
        console.error('Error inserting data:', error);
        await client.query('ROLLBACK');
        client.release();
        throw new Error('Error inserting data:', (error as any).message)
    }
}


export const priorityCheckerPersistance = (due_date: string): number => {
    const due_date_obj = new Date(due_date);
    const current_Date = new Date();
    let priority: number = 0;

    const dayDiff =  due_date_obj.getDate() - current_Date.getDate();
    if (dayDiff === 0) {
        priority = 0;
    } else if (dayDiff >= 1 && dayDiff <= 2) {
        priority = 1;
    } else if (dayDiff >= 3 && dayDiff <= 4) {
        priority = 2;
    } else {
        priority = 3;
    }

    return priority;
}
