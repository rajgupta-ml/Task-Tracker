import express, { Request, Response, response } from 'express';
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
import jwt from 'jsonwebtoken';
import { userLoginDataResponeInterface } from './interfaces/userDataDBInterface.js';
import cookieParser from 'cookie-parser';
import { taskDataInterface } from './interfaces/taskDataInterface.js';
import { taskDataSanitization } from './SanitizationWorker/taskDataSanitization.js';
import { jwtDecodePersistance } from './persistance/jwtEncodeDecodePersistance.js';
import { taskCreationInteractor } from './Interactor/taskCreationInteractor.js';

const app = express();
let client: PoolClient;;
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser());
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
        const responesData : userLoginDataResponeInterface = await authInteractor(SantizedUserDetails, client, bcrypt, jwt);
        response.cookie("jwt" , responesData.jwt, {httpOnly : true});
        (response as any).success(responesData.user_id, "User authenticated successfully");
    } catch (error) {
        (response as any).error("Unauthorized", 401);
    }
})


// The user can createTask
    // --- JWT VALIDATION
    // --- DATA SANITIZATION OF THE REQUEST BODY
    // --- CREATING THE DATABASE AND INSERTING THE DATA AND RETERIVING THE TASK_ID




// creating the Main task for the user
app.post("/api/task", jwtDecodePersistance,  async(req: Request, res : Response) => {
    const taskData : taskDataInterface = req.body;
    try {
        // data sanitization 
        const SanitizedData: taskDataInterface = taskDataSanitization(taskData); 
        if(!client) {
            (res as any).error('Database client is not available. ', 500);
            return;
        }
        // Calling the interactor
        const task_id : number =  await taskCreationInteractor(SanitizedData, client);

        if(!task_id){
            (res as any).error("Could generate the task");
            return;
        }

        (res as any).success({task_id}, "Task created Successfully");

        

    } catch (error) {
        if (error instanceof Error) {
            // If it's a known error (e.g., database constraint violation), provide a specific error message
            if ((error as any).code === '23502') { // PostgreSQL error code for NOT NULL violation
                (res as any).error('Missing required data for task creation.')
            } else if ((error as any).code === '23503') { // PostgreSQL error code for foreign key constraint violation
                (res as any).error('User Id Does not exist')
            } else {
                // For other types of errors, re-throw the error with a generic message
                (res as any).error('An error occurred while creating the task.', 500, (error as any).message)
            }
        } else {
            // If it's not an instance of Error, re-throw the original error
            (res as any).error('An error occurred while creating the task.', 500 , (error as any).message)
        }
    }

})


// Task Updation 
// --- JWT VERIFICATION 
// --- SANITIZE THE PAYLOAD
// --- UPDATE THE DATABASE
// --- SEND THE SUCCESS MESSAGE WITHOUT ANY DATA 



app.patch("/api/task", jwtDecodePersistance, (req : Request, res : Response) => {
    // DATA SANITIZATION  
    
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
