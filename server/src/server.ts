import express, { Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config'
import bodyParser from 'body-parser';
import { registrationInteractor } from './Interactor/registrationInteractor.js';
import { userRegistrationDataSanitization } from './SanitizationWorker/userRegistrationDataSanitiazation.js';
import { ErrorHandler } from './middleware/errorHandler.js';
import { userRegistrationInterface } from './interfaces/userRegistrationInterface.js';
import { DatabaseConnection } from './persistance/databaseConnectPersistance.js';
import { PoolClient } from 'pg';

const app = express();
let client: PoolClient;;
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
const PORT = process.env.PORT || 5000;

// The user registration API 
app.post("/api/auth/registration", (request: Request, response: Response) => {
    // Sanitizing the data 
    const SantizedUserDetails: userRegistrationInterface = userRegistrationDataSanitization(request.body)

    if (client) {
        registrationInteractor(SantizedUserDetails, client);
    } else {
        response.status(500).json({ success: false, message: 'Database client is not available.' });
    }
});

app.use(ErrorHandler);

app.listen(PORT, async () => {
    console.log(`The server is running on PORT: ${PORT}`);
    try {
        const db = new DatabaseConnection();
        client = await db.connect();
    } catch (error) {
        console.error('Error connecting to the database:', (error as any).message);
    }
})
