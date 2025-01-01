/*
This code defines a higher-order function `asyncHandler` that wraps a given function `fn` with error handling using Promises. It catches any errors thrown by `fn` and passes them to the `next` function, typically used in Express.js middleware for error handling.*/

const asyncHandler = (fn) => {
    return (req, res, next) => {
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