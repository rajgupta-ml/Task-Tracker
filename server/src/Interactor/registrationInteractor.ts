import { PoolClient } from "pg";
import { userRegistrationInterface } from "../interfaces/userRegistrationInterface.js";
import { passwordEncryptionPersistance } from "../persistance/passwordHashingPersistance.js";
import { registerUserInDB } from "../persistance/registerUserInDatabase.js";


export const registrationInteractor = async (data: userRegistrationInterface, client: PoolClient, bcrypt : any) => {


    try {
        // Password Encryption 
        const hashPassword = await passwordEncryptionPersistance(data.userPassword, bcrypt);
        // Registering the user
        await registerUserInDB(client, data.userPhoneNumber, hashPassword);
        // upon unsuccesfull registertion throw error
    } catch (error) {
        // console.error("Error in registration interactor:", (error as any).message);
        throw error;
    }

}