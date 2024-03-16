import { PoolClient } from "pg";
import { filterInterface, returnStatusResult, taskDataInterface, taskDeletionInterface, taskUpdationInterface } from "../interfaces/taskDataInterface.js";
export const taskCreationPersistance  = async (task_data : taskDataInterface, client: PoolClient) : Promise<number> => {
    const tableCreation : string = 
    `
    CREATE TABLE IF NOT EXISTS task (
    task_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    task_title VARCHAR(255) NOT NULL,
    task_description TEXT NOT NULL,
    task_due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'TODO',
    priority INT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
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
        return task_id;
    } catch (error) {
        console.error('Error inserting data:', error);
        await client.query('ROLLBACK');
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


export const taskUpdationOnDBPersistance = async (task_data : taskUpdationInterface, client : PoolClient) => {

    const {task_id, status, due_date} = task_data;
    let paramIndex = 1;
    const params = [];
    let updateQuery = `UPDATE task SET`;
    if (status) {
        updateQuery += ` status = $${paramIndex++}`;
        params.push(status);
    }

    if (due_date) {
        if (status) {
            updateQuery += `,`; // Add comma if both status and due_date are present
        }
        updateQuery += ` task_due_date = $${paramIndex++}`;
        params.push(due_date);
        const priority = priorityCheckerPersistance(due_date);
        updateQuery += `, priority = $${paramIndex++}`;
        params.push(priority);
    }

    updateQuery += `, updated_at = CURRENT_TIMESTAMP`;

    updateQuery += `
        WHERE task_id = $${paramIndex++}
        AND is_deleted = $${paramIndex++}
        RETURNING task_id;
    `;

    params.push(task_id)
    params.push(false);
    try {
        await client.query('BEGIN');
        await client.query(updateQuery, params);
        await client.query('COMMIT');
    } catch (error) {
        console.error('Error updating data:', error);
        await client.query('ROLLBACK');
        throw new Error('Error updating data:', (error as any).message)
    }
}




export const getFilterDataPersistance = async (filter: filterInterface, client : PoolClient) : Promise<object>=>{
    let {priority, due_date, page, limit} = filter;
    const {user_id} = filter;

    // Construct the base SELECT query
    let query = `SELECT * FROM task WHERE user_id = $1 AND is_deleted = $2`;

    // Initialize the parameters array with the user_id
    const params = [user_id, false]; 
    // Add filters to the query dynamically
    if (priority !== undefined) {
        query += ` AND priority = $${params.length + 1}`;
        params.push(parseInt(priority));
    }

    if (due_date !== undefined) {
        query += ` AND task_due_date = $${params.length + 1}`;
        params.push(due_date as any);
    }

    // Add pagination
    if(page !== undefined && limit !== undefined){
        const offset = (parseInt(page) - 1) * parseInt(limit);
        query += ` ORDER BY task_due_date ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(parseInt(limit), offset);
    }


     try {
        const { rows } = await client.query(query, params);
        return rows;
    } catch (error) {
        console.error('Error fetching tasks:', error);
        throw new Error('Error fetching tasks:', (error as any).message);
    }

} 


export const taskDeletionPersistance = async (task_id: taskDeletionInterface, client: PoolClient) => {
    const ts = task_id.task_id;
    const deletionQuery = `UPDATE task SET is_deleted = $1, deleted_at = CURRENT_TIMESTAMP WHERE task_id = $2`;
    const params = [true, ts];
    try {
        await client.query('BEGIN');
        await client.query(deletionQuery, params);
        await client.query('COMMIT');
    } catch (error) {
        console.error('Error deleting the data:', error);
        await client.query('ROLLBACK');
        throw new Error('Error deleting the data:', (error as any).message);
    }
};


export const istaskIdValidPersistance = async (data : taskDeletionInterface, client : PoolClient) :Promise<boolean> => {
    const ts = data.task_id;
    const validQuery = `Select * from task WHERE task_id = $1 AND is_deleted = $2`;

    try {
        let flag = false;
        const {rows} = await client.query(validQuery, [ts, false])
        if(rows.length > 0) flag = true;
        return flag;
    } catch (error) {
        console.error('Error deleting the data:', error);
        throw new Error('Error deleting the data:', (error as any).message);
    }
}


export const subTaskCreationPersistance = async (data : taskDeletionInterface, client: PoolClient) : Promise<number> => {
    const ts = data.task_id;
    const tableCreationQuery = 
    `
    CREATE TABLE IF NOT EXISTS subTask (
    task_id SERIAL PRIMARY KEY,
    father_id INT NOT NULL,
    status INT NOT NULL DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    FOREIGN KEY (father_id) REFERENCES task(task_id)
    );
    `
    const createSubTaskQuery = 
    `
    INSERT INTO subTask (father_id) values ($1) RETURNING task_id
    `

    try {
        await client.query(tableCreationQuery);

        await client.query("BEGIN");
        const {rows} = await client.query(createSubTaskQuery, [ts]);
        const sub_task_id : number = rows[0].task_id;
        await client.query("COMMIT");
        return sub_task_id;
    } catch (error) {
        console.error('Error inserting data:', error);
        await client.query('ROLLBACK');
        throw new Error('Error inserting data:', (error as any).message)
    }

}


export const subTaskUpdationPersistance = async (data : taskDeletionInterface, client : PoolClient): Promise<number> => {
    const task_id : number | undefined= data.task_id;
    const updationQuery = 
    `
    UPDATE subtask 
    SET status = CASE 
        WHEN status = 0 THEN 1
        ELSE 0
    END
    WHERE task_id = $1 AND is_deleted = $2
    RETURNING father_id;
    `;

    try {
        await client.query('BEGIN');
        const {rows} = await client.query(updationQuery, [task_id, false]);
        await client.query('COMMIT');
        const id = rows[0].father_id;
        return id
    } catch (error) {
        console.error('Error deleting the data:', error);
        await client.query('ROLLBACK');
        throw new Error('Error deleting the data:', (error as any).message);
    }
    
}






export const getSubTaskWithSameTaskId = async (data: taskDeletionInterface, client : PoolClient): Promise<returnStatusResult> => {
    const task_id : number | undefined = data.task_id;
    const selectQuery = `
        SELECT * from subtask WHERE father_id = $1 AND status = $2
    `
    try {
        await client.query('BEGIN');
          const promises = [
            client.query(selectQuery, [task_id, 0]),
            client.query(selectQuery, [task_id, 1])
        ];

        const [result1, result2] = await Promise.all(promises);

        await client.query('COMMIT');
        return {incomplete : result1.rows.length, complete : result2.rows.length}
    } catch (error) {
        console.error('Error deleting the data:', error);
        await client.query('ROLLBACK');
        throw new Error('Error deleting the data:', (error as any).message);
    }

}

export const subTaskDeletionPersistance = async(data: taskDeletionInterface, client: PoolClient, taskDeletionCommand : boolean) => {
    let deletionQuery;
    const task_id : number | undefined = data.task_id;
    if(taskDeletionCommand) deletionQuery = "UPDATE subtask set is_deleted = $1, deleted_at = CURRENT_TIMESTAMP WHERE father_id = $2";
    else deletionQuery = "UPDATE subtask set is_deleted = $1, deleted_at = CURRENT_TIMESTAMP WHERE task_id = $2";

    try {
        await client.query('BEGIN');
        await client.query(deletionQuery, [true, task_id]);
        await client.query('COMMIT');
    } catch (error) {
        console.error('Error deleting the data:', error);
        await client.query('ROLLBACK');
        throw new Error('Error deleting the data:', (error as any).message);
    }
}   


export const getFilteredSubTaskPersistance = async(data: taskDeletionInterface, client: PoolClient) : Promise<object> => {
    const deletionQuery = 'SELECT * from subtask WHERE is_deleted = $1 AND father_id = $2';
    const task_id = data.task_id;
 
    try {
        await client.query('BEGIN');
        const {rows} = await client.query(deletionQuery, [false, task_id]);
        await client.query('COMMIT');
        return rows;
    } catch (error) {
        console.error('Error deleting the data:', error);
        await client.query('ROLLBACK');
        throw new Error('Error deleting the data:', (error as any).message);
    }
}   

