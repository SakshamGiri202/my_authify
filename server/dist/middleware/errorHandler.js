export function errorHandler(err, req, res, next) {
    console.error("[Unhandled Error]:", err);
    const statusCode = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(statusCode).json({
        error: err.name || "INTERNAL_SERVER_ERROR",
        message: process.env.NODE_ENV === "production" && statusCode === 500
            ? "An unexpected error occurred."
            : message,
    });
}
//# sourceMappingURL=errorHandler.js.map