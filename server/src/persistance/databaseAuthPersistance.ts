import { userDataDBInterface } from "../interfaces/userDataDBInterface.js";
import { userRegistrationInterface } from "../interfaces/userRegistrationInterface.js";
import { PoolClient } from "pg";

export const databaseAuthPersistance = async (userDetails : userRegistrationInterface, client : PoolClient) : Promise<userDataDBInterface> => {
    const query = `SELECT * FROM users WHERE phone_number = ($1)`;



    try {
        const dbResult = await client.query(query, [userDetails.userPhoneNumber]);
            if (dbResult.rows.length === 0) {
            // If no user found, return null or throw an error as per your requirement
            throw new Error("User not found");
        }
        const { password, user_id } = dbResult.rows[0];
        return { hsh_password: password, user_id: user_id };
    } catch (error) {
        console.error(error);
        throw new Error("Not Authorized");
    }
}