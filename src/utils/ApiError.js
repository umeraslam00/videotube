class ApiError extends Error {
    constructor(
        statusCode,
        message= "something went wrong",
        errors = [],
        statck = ""
    ){
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.data = null,
        this.message = message

        if (statck) {
            this.stack = statck
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export default ApiError;

/*
Here is a succinct explanation of the class definition:

**Class:** `apiError` (extends the built-in `Error` class)

**Methods:**

* **`constructor`**: Initializes a new instance of the `apiError` class with the following properties:
	+ `statusCode`: a numeric status code for the error
	+ `message`: a human-readable error message (defaults to "something went wrong")
	+ `errors`: an array of error details (defaults to an empty array)
	+ `statck`: an optional stack trace string (if provided, it will be used; otherwise, the stack trace will be generated automatically)
	+ `data`: a property that is always set to `null`
	+ `message`: the same as the `message` parameter (redundant, but likely intended to override the inherited `message` property from the `Error` class)

Note that the `constructor` method also calls `Error.captureStackTrace` to generate a stack trace if `statck` is not provided.
*/

/*
Here's an explanation of the `super` call in the `constructor` method:

**`super(message)`**:

In JavaScript, when you extend a class (like `Error` in this case), you can call the parent class's constructor using the `super` keyword. This is called "calling the superclass constructor".

By calling `super(message)`, the `apiError` class is passing the `message` parameter to the `Error` class's constructor. This is because the `Error` class's constructor expects a `message` parameter, which is used to set the error message.

The reason only `message` is passed to `super` is that the `Error` class's constructor only expects a single parameter, `message`. The other properties (`statusCode`, `errors`, `data`, and `statck`) are specific to the `apiError` class and are not part of the `Error` class's constructor.

By calling `super(message)`, the `apiError` class is ensuring that the `Error` class's constructor is properly initialized with the error message, and then it can proceed to set its own properties (`statusCode`, `errors`, etc.) in the rest of the constructor.

If the `apiError` class didn't call `super(message)`, it would not be properly extending the `Error` class, and the error message would not be set correctly.
*/