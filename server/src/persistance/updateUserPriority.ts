import { PoolClient } from "pg";

export const updateUserPriority = async (userIds: string[], client : PoolClient) => {

    const promises = [];
     try {
        // Begin a transaction
        await client.query('BEGIN');
        // Iterate over the object_user_id array
        for (let i = 0; i < userIds.length; i++) {
            const user_id = userIds[i];
            const priority = i + 1; // Priority is 1-based index
            // Update priority for each user_id
            const query = `UPDATE users SET priority = $1 WHERE user_id = $2`;
            promises.push(client.query(query, [priority, user_id]));
        }
        await Promise.all(promises);
        // Commit the transaction
        await client.query('COMMIT');
    } catch (error) {
        // Rollback the transaction if an error occurs
        await client.query('ROLLBACK');
        console.error('Error updating priority:', error);
        throw error;
    }
}