import { Request, Response, NextFunction } from 'express';


export const ErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.log("Middleware Error Handling");
    const errStatus = (err as any).status_code || 500;
    const errMsg = err.message || 'Something went wrong';
    res.status(errStatus).json({
        success: false,
        status: errStatus,
        message: errMsg,
        stack: process.env.NODE_ENV === 'development' ? err.stack : {}
    });
};
