import { PoolClient } from "pg";
import { userRegistrationInterface } from "../interfaces/userRegistrationInterface.js";
import { databaseAuthPersistance } from "../persistance/databaseAuthPersistance.js";
import { passwordComparePersistance } from "../persistance/passwordHashingPersistance.js";
import { jwtSignPersistance } from "../persistance/jwtEncodeDecodePersistance.js";
import { userDataDBInterface, userLoginDataResponeInterface } from "../interfaces/userDataDBInterface.js";

export const authInteractor = async (userDetails : userRegistrationInterface, client : PoolClient, bcrypt: any, jwt: any) : Promise<userLoginDataResponeInterface> => {

    const userPasswword = userDetails.userPassword;
    // verify the credintial in the database
    try {
        const userData : userDataDBInterface = await databaseAuthPersistance(userDetails, client);
        await passwordComparePersistance(userData.hsh_password, userPasswword, bcrypt);
        const JWT_TOKEN = jwtSignPersistance(userData.hsh_password, jwt);
        return {jwt: JWT_TOKEN, user_id : userData.user_id};
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        const validationError = new Error(`Invalid request body: ${errorMessage}`);
        (validationError as any).status_code = 401;
        throw validationError;
    }


}