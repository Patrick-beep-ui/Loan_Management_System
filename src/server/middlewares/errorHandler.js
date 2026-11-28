import { AppError } from "../utils/errors.js";

export function errorHandler(error, req, res, next) {
    if (res.headersSent) {
        return next(error);
    }

    if (error instanceof AppError && error.statusCode < 500) {
        return res.status(error.statusCode).json({ error: error.message });
    }

    console.error(`Unhandled error for ${req.method} ${req.originalUrl}:`, error);
    return res.status(500).json({ error: "Internal Server Error" });
}
