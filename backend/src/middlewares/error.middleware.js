import httpStatus from "http-status";

export const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? httpStatus.INTERNAL_SERVER_ERROR : res.statusCode;
    
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
};
