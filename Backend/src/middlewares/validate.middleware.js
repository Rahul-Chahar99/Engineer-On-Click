const validate = (schema) => (req, res, next) => {
  try {
    // parse() throws an error if validation fails
    schema.parse(req.body);
    next();
  } catch (error) {
    console.log("error is :", error);

    // Use Zod's native .issues array (some versions do not support .errors)
    let errorMessage = "Validation failed";
    if (error.name === "ZodError" && error.issues.length > 0) {
      errorMessage = error.issues[0].message;
    }

    return res.status(400).json({
      message: errorMessage,
      errors: error.name === "ZodError" ? error.flatten().fieldErrors : {},
    });
  }
};

// Usage in your routes:
// router.post('/register', validate(registerSchema), registerController);

export { validate };
