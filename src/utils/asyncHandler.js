/*
This code defines a higher-order function `asyncHandler` that takes a function `fn` as an argument. It returns a new function that wraps `fn` with error handling using Promises. If `fn` throws an error or returns a rejected Promise, it catches the error and passes it to the `next` function, typically used in Express.js middleware for error handling.
*/

const asyncHandler = (fn) => {
    (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((err) => next(err))
    }
}

export default asyncHandler



/* 
This code defines a higher-order function `asyncHandler` that takes another function `fn` as an argument. It returns a new async function that wraps the original function `fn` with error handling. If `fn` throws an error, it catches the error and returns a JSON response with a 500 status code (or the error code if available) and an error message.

It does the same thing as the above function. But, it is more easier for us.

const asyncHandler = (fn) => {
    async(req, res, next) => {
        try {
            await fn(req, res, next)

        } catch(err) {
            res.status(err.code || 500).json({
                success: false,
                error: err.message
            })
        }
    }
}

*/