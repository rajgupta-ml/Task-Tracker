import express, { Request, Response, response } from 'express';
import cors from 'cors';
import 'dotenv/config'
import bodyParser from 'body-parser';
import { registrationInteractor } from './Interactor/registrationInteractor.js';
import { userRegistrationDataSanitization } from './SanitizationWorker/userRegistrationDataSanitiazation.js';
import { ErrorHandler } from './middleware/errorHandler.js';
import { userRegistrationInterface } from './interfaces/userRegistrationInterface.js';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
const PORT = process.env.PORT || 5000;

// The user registration API 
app.post("/api/auth/registration", (request: Request, response: Response) => {
    const SantizedUserDetails: userRegistrationInterface = userRegistrationDataSanitization(request.body)
    registrationInteractor(SantizedUserDetails);
});

app.use(ErrorHandler);

app.listen(PORT, () => {
    console.log(`The server is running on PORT: ${PORT}`);
})
