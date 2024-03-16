import express, { Request, Response, response } from 'express';
import cors from 'cors';
import cron from 'node-cron'
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
import { filterInterface, taskDataInterface, taskDeletionInterface, taskUpdationInterface } from './interfaces/taskDataInterface.js';
import { getFilterDataSanitization, taskDataSanitization, taskDeletionSanitization, taskUpdationSanitization } from './SanitizationWorker/taskDataSanitization.js';
import { jwtDecodePersistance } from './persistance/jwtEncodeDecodePersistance.js';
import { subTaskCreationInteractor, taskCreationInteractor } from './Interactor/taskCreationInteractor.js';
import { taskUpdationInteractor } from './Interactor/taskUpdationInteractor.js';
import { getFilterDataInteractor } from './Interactor/getFilterDataInteractor.js';
import { taskDeletionInteractor } from './Interactor/taskDeletionInteractor.js';
import { subTaskUpdationInteractor } from './Interactor/subTaskUpdationInteractor.js';
import { subTaskDeletionInteractor } from './Interactor/subTaskDeletionInteractor.js';
import { getFilteredSubTaskInteractor } from './Interactor/getFilteredSubTaskInteractor.js';
import { cronTaskPriorityUpdateInteractor } from './Interactor/cronTaskPriorityUpdateInteractor.js';
import { cronTaskTwiloInteractor } from './Interactor/cronTaskTwiloInteractor.js';

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



app.patch("/api/task", jwtDecodePersistance, async (req : Request, res : Response) => {

    const taskUpdationData : taskUpdationInterface = req.body;
    try {
        // DATA SANITIZATION  
        const SanitizedData: taskUpdationInterface = taskUpdationSanitization(taskUpdationData); 
        if(!client) {
            (res as any).error('Database client is not available. ', 500);
            return;
        }
        // CALLING THE INTERACTOR 
        await taskUpdationInteractor(SanitizedData, client);
        (res as any).success(null, "Updation Succesfull");
    } catch (error) {
        if(error instanceof Error){
            (res as any).error("Could Not update the task", 400, (error as any).message);
        }else{
            (res as any).error("Internal Error Error");
        }
    }


})


// Get All the user task using the filters(Priority, due_date and proper_pagination)
// --- It will be get request with filter as a query parameter
// --- Santize the query paramater 
// --- Get the data from the database
// --- CAN BE DONE Implement a caching mechanism to store the frequently requested task.
 

app.get("/api/task/:user_id", jwtDecodePersistance, async (req : Request, res : Response) => {
    const {user_id} = req.params;

    try {
        const filters: filterInterface = {
            user_id: parseInt(user_id), ...req.query,
        };
        // Query Sanitization
        const sanitizationData : filterInterface = getFilterDataSanitization(filters)

        if(!client) {
            (res as any).error('Database client is not available. ', 500);
            return;
        }
        
        // Get the data from the database
        const data = await getFilterDataInteractor(sanitizationData, client);
        (res as any).success(data, "The data is successfully reterieved", 200);

    } catch (error) {
        if(error instanceof Error){
            (res as any).error("Could Not Get the task", 400, (error as any).message);
        }else{
            (res as any).error("Internal Error Error");
        }
    }
})




// soft delete a task using task id
// --- Validate the JWT token
// --- deleted_at chenage the timeStamp to currect time_stamp
// --- isDeleted change the false to true


app.delete("/api/task/:task_id", jwtDecodePersistance, async (req : Request, res : Response  ) => {
    const task_id: number = parseInt(req.params.task_id);
    const sanitizatedData: taskDeletionInterface = taskDeletionSanitization({ task_id });
    try {

        if(!client) {
            (res as any).error('Database client is not available. ', 500);
            return;
        }
        // Calling the interactor
        await taskDeletionInteractor(sanitizatedData,client);

         (res as any).success(null, "The task has been successfully deleted", 200);
    } catch (error) {
        if(error instanceof Error){
            (res as any).error("Could not delete the task", 400, (error as any).message);
        }else{
            (res as any).error("Internal Error Error");
        }
    }
})


// Create Sub-task using the task_id 
// --- validate JWT
// --- santize the task_id
// --- Check if the task is present on the task_table
// --- Create a sub stack with status = 0 and is_deleted = false
// --- Return the sub-task id 

app.post("/api/sub-task" , jwtDecodePersistance, async (req: Request, res : Response) => {
    const {task_id} : taskDeletionInterface = req.body;
    // Data sanitization using the task deletion Sanitization Function
    const sanitizatedData = taskDeletionSanitization({task_id});

    try {
        if(!client) {
            (res as any).error('Database client is not available. ', 500);
            return;
        }
        const sub_task_id : number = await subTaskCreationInteractor(sanitizatedData, client);
        (res as any).success(sub_task_id, "New Sub Task has been created");
    } catch (error) {
        if(error instanceof Error){
            (res as any).error("Could not create a new sub-task", 400, (error as any).message);
        }else{
            (res as any).error("Internal Error Error");
        }
    }

})


app.get("/api/sub-task/:task_id", jwtDecodePersistance, async (req : Request, res : Response) => {
    const task_id = parseInt(req.params.task_id);
    // Query Sanitization
    const sanitizationData : taskDeletionInterface = taskDeletionSanitization({task_id})

    try {
        if(!client) {
            (res as any).error('Database client is not available. ', 500);
            return;
        }
        
        // Get the data from the database
        const data = await getFilteredSubTaskInteractor(sanitizationData, client);
        (res as any).success(data, "The data is successfully reterieved", 200);

    } catch (error) {
        if(error instanceof Error){
            (res as any).error("Could Not Get the task", 400, (error as any).message);
        }else{
            (res as any).error("Internal Error Error");
        }
    }
})



// Updation of status using the sub_task_id 
// -- Validate JWT 
// -- Sanitize the sub_task_id
// -- update the status in the subtask table
// -- Run a worker on sub_task table and find the number of incomplete sub-task with the same task_id and update the status of table using the task_id
// -- Send Success Response


app.patch("/api/sub-task", jwtDecodePersistance, async(req: Request, res: Response) => {
    const sub_task_id : number = req.body.sub_task_id;
    const sanitizatedData : taskDeletionInterface = taskDeletionSanitization({task_id: sub_task_id});

    try {
        if(!client) {
            (res as any).error('Database client is not available. ', 500);
            return;
        }

        await subTaskUpdationInteractor(sanitizatedData, client);
        (res as any).success(sub_task_id, "Status Updated");
    } catch (error) {
        if(error instanceof Error){
            (res as any).error("Could not create a new sub-task", 400, (error as any).message);
        }else{
            (res as any).error("Internal Error Error");
        }
    }

})


// soft delete a sub-task using task id
// --- Validate the JWT token
// --- deleted_at chenage the timeStamp to currect time_stamp
// --- isDeleted change the false to true

app.delete("/api/sub-task/:sub_task_id", jwtDecodePersistance, async(req :Request, res : Response) => {
    const task_id: number = parseInt(req.params.sub_task_id);
    const sanitizatedData: taskDeletionInterface = taskDeletionSanitization({ task_id });
    try {

        if(!client) {
            (res as any).error('Database client is not available. ', 500);
            return;
        }
        // Calling the interactor
        await subTaskDeletionInteractor(sanitizatedData,client);
        (res as any).success(null, "The task has been successfully deleted", 200);
    } catch (error) {
        if(error instanceof Error){
            (res as any).error("Could not delete the task", 400, (error as any).message);
        }else{
            (res as any).error("Internal Error Error");
        }
    }
})


const cronForPriority = () => {
        const task = cron.schedule('* * * * *', async () => {
            // For jobs to run every day, make the cron 0 0 * * *
            await cronTaskPriorityUpdateInteractor(client);
            console.log("Priority has been updated");
        });

        task.start()
} 


const cronForTwilo = () => {
    const task = cron.schedule('* * * * *', async () => {
        await cronTaskTwiloInteractor(client);
        console.log("The call has been made");
    })


    task.start();

}

// cronForPriority();
// cronForTwilo();
app.listen(PORT, async () => {
    console.log(`The server is running on PORT: ${PORT}`);
    try {
        const db = new DatabaseConnection();
        client = await db.connect();
    } catch (error) {
        console.error('Error connecting to the database:', (error as any).message);
    }
})
