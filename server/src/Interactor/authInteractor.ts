import { PoolClient } from "pg";
import { userRegistrationInterface } from "../interfaces/userRegistrationInterface.js";

export const authInteractor = async (userDetails : userRegistrationInterface, client : PoolClient, bcrypt: any) => {

}