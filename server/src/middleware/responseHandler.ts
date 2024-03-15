import { Request, Response, NextFunction } from 'express';

interface CustomResponse extends Response {
  success: (data?: any, message?: string, status?: number) => void;
  error: (message?: string, status?: number) => void;
}

export const responseHandler = (req: Request, res: CustomResponse, next: NextFunction) => {
    res.success = function (data: any = null, message: string = 'Success', status: number = 200) {
        return res.status(status).json({ success: true, message, data });
    };

    res.error = function (message: string = 'Internal Server Error', status: number = 500, error_message: string = "Unknow Error") {
        console.log("Middleware Error Handling");
        const errMsg = message || 'Something went wrong';
        res.status(status).json({
            success: false,
            status,
            message: errMsg,
            error: process.env.NODE_ENV === 'development' ? error_message : undefined
        });
    };

    next();
};
