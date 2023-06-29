const ErrorHandler = require("../utils/errorHandler");


module.exports = (err, req, resp, next) => {

    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    //wrong mongodb id error
    //ex :- lets say we have  give a 3..4 digit id to mongodb then we have
    //to handle that error too. (castError)

    if (err.name === "CastError") {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    //email already exists
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
        err = new ErrorHandler(message, 400);
    }

    //for invalid json web token
    if (err.name === "JsonWebTokenError") {
        const message = `Json Web Token is Invalid! Try Again`;
        err = new ErrorHandler(message, 400);
    }

    //for Jwt Expire
    if (err.name === "TokenExpiredError") {
        const message = `Json Web Token is Expired! Try Again`;
        err = new ErrorHandler(message, 400);
    }

    resp.status(err.statusCode).json({
        success: false,
        message: err.message,
        errorIn: err.stack
    })
}