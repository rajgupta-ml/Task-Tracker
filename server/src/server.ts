import express, { Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config'
import bodyParser from 'body-parser';
import { registrationInteractor } from './Interactor/registrationInteractor.js';
import { userRegistrationDataSanitization } from './SanitizationWorker/userRegistrationDataSanitiazation.js';
import { userRegistrationInterface } from './interfaces/userRegistrationInterface.js';
import { DatabaseConnection } from './persistance/databaseConnectPersistance.js';
import { PoolClient } from 'pg';
import bcrypt from 'bcrypt';
import { responseHandler } from './middleware/responseHandler.js';
import { authInteractor } from './Interactor/authInteractor.js';

const app = express();
let client: PoolClient;;
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
const PORT = process.env.PORT || 5000;


app.use(responseHandler as any);


// The user registration API 
app.post("/api/auth/registration", async (request: Request, response: Response) => {
    // Sanitizing the data 
    const SantizedUserDetails: userRegistrationInterface = userRegistrationDataSanitization(request.body);

    // checking If the DB client is available or not 
    if (client) {
        try {
            // User registration to the data using the santized Data phone number and password
            await registrationInteractor(SantizedUserDetails, client, bcrypt);
            (response as any).success(null, "User registered successfully");
        } catch (error) {
            (response as any).error((error as any).message, 500);
        }
    } else {
            (response as any).error('Database client is not available.', 500);

    }
});


// The user Login route

app.post("/api/auth/login", async(request : Request, response : Response) => {
    // Sanitize the user details before the data is used anywhere else
    const SantizedUserDetails: userRegistrationInterface = userRegistrationDataSanitization(request.body);

    // checking if the DB client is available or not
    if(!client) (response as any).error('Database client is not available. ', 500);

    try {
        // The bussiness logic to verify the user and create a JWT token.
        const jwt = await authInteractor(SantizedUserDetails, client, bcrypt);
        
        (response as any).success({jwt}, "User authenticated successfully");
    } catch (error) {
        (response as any).error("Unauthorized", 401);
    }


})





app.listen(PORT, async () => {
    console.log(`The server is running on PORT: ${PORT}`);
    try {
        const db = new DatabaseConnection();
        client = await db.connect();
    } catch (error) {
        console.error('Error connecting to the database:', (error as any).message);
    }
})
