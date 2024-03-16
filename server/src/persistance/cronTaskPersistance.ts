import { PoolClient } from "pg";

export const cronTaskPriorityUpdatePersistance = async(client : PoolClient) => {
    const priorityUpdatequery = 
    `
    UPDATE task
    SET priority = 
        CASE 
            WHEN task_due_date = CURRENT_DATE THEN 0
            WHEN task_due_date = CURRENT_DATE + INTERVAL '1 day' THEN 1
            WHEN task_due_date <= CURRENT_DATE + INTERVAL '2 days' THEN 2
            WHEN task_due_date <= CURRENT_DATE + INTERVAL '4 days' THEN 2
            ELSE 3
        END
    WHERE is_deleted = FALSE;
     `;

    try {
        await client.query('BEGIN');
        await client.query(priorityUpdatequery);
        await client.query('COMMIT');
    } catch (error) {
        console.error('Error updating task priority:', error);
        await client.query('ROLLBACK');
        throw new Error('Error updating task priority:', (error as any).message);
    }
};
