import { PoolClient } from "pg";

export const fetchPhoneNumbersByPriority = async (client: PoolClient): Promise<string[]> => {
    const phoneNumbers: string[] = [];
    try {
        const query = `
            SELECT phone_number 
            FROM users 
            WHERE priority >= 0 
            ORDER BY priority ASC
        `;
        const { rows } = await client.query(query);
        rows.forEach(row => {
            phoneNumbers.push(row.phone_number);
        });
        return phoneNumbers;
    } catch (error) {
        console.error('Error fetching phone numbers by priority:', error);
        throw error;
    }
}
