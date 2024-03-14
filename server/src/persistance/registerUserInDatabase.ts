import { PoolClient } from "pg";

export const registerUserInDB = async (client: PoolClient, phone_number: string, password: string) => {
    const query = `CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        phone_number VARCHAR(255) UNIQUE,
        password VARCHAR(255)
    );
    `

    const insertDataQuery = `
        INSERT INTO users (phone_number, password) VALUES ($1, $2)
    `;
    
    try {
        await client.query(query);
        await client.query(insertDataQuery, [phone_number, password]);
    } catch (error) {
        // console.error("Error registering user:", (error as any).message);
        throw new Error((error as any).message);
    }
}