import { PoolClient } from "pg";

export const getUserIdWithPendingTaskPersistance = async(client : PoolClient) => {
    const fetchQuery = 
    `
    SELECT user_id from task WHERE task_due_date < CURRENT_DATE AND is_deleted = False; 
     `;

    try {
        await client.query('BEGIN');
        const {rows} = await client.query(fetchQuery);
        await client.query('COMMIT');
        return rows;
    } catch (error) {
        console.error('Error updating task priority:', error);
        await client.query('ROLLBACK');
        throw new Error('Error updating task priority:', (error as any).message);
    }
};
