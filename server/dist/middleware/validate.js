import { ZodError } from "zod";
export const validateRequest = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    error: "VALIDATION_ERROR",
                    details: error.errors.map((e) => ({
                        field: e.path.join("."),
                        message: e.message,
                    })),
                });
                return;
            }
            next(error);
        }
    };
};
//# sourceMappingURL=validate.js.map