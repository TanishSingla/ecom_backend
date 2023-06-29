const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middleware/catchAsyncErrors");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const sendToken = require("../utils/jwtToken");
const bcrypt = require("bcryptjs")

//options for cookie
const options = {
    expiresIn: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
};

//Register a User 
exports.registerUser = catchAsyncError(async (req, resp, next) => {

    const { name, email, password } = req.body;
    const user = await User.create({
        name, email, password,
        avatar: {
            public_id: "sample_id",
            url: "sample_url"
        }
    });

    const token = user.getJWTToken();

    resp.status(201).cookie("token", token, options).json({
        success: true,
        user,
        token,
    })
})

//login user

exports.loginUser = catchAsyncError(async (req, resp, next) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler("Please Enter Email and Password", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new ErrorHandler("Invalid Credentials"))
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
        return next(new ErrorHandler("Invalid Credentials", 401))
    }

    const token = user.getJWTToken();

    resp.status(200).cookie("token", token, options).json({
        success: true,
        token,
    });
})

//logout
exports.logout = catchAsyncError(async (req, resp, next) => {

    resp.cookie("token", "", {
        expiresIn: new Date(Date.now()),
        httpOnly: true,
    });

    resp.status(200).json({
        success: true,
        message: "Logged Out Successfuly",
    });
})

//forgot password :- 
exports.forgotPassword = catchAsyncError(async (req, resp, next) => {
    const { email } = req.body;
    let user = await User.findOne({ email: email });


    if (!user) {
        return next(new ErrorHandler("User Not Found", 404));
    }

    //get reset password token
    const resetToken = user.getResetPasswordToken();


    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

    const message = `Your Password reset token is 
    :- \n\n ${resetPasswordUrl} \n\n. IF YOU HAVE
    NOT REQUESTED THIS , KINDLY IGNORE.`;

    try {
        await sendEmail({
            email: user.email,
            subject: "Ecommerce Password Recovery",
            message,
            html: `<a href="${resetPasswordUrl}"> Click </a>`
        });
        resp.status(200).json({
            success: true,
            message: `Email sent succesfully to ${user.email}`
        })


    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(err.message, 500));
    }
})

exports.sendEmail = async (req, resp, next) => {
    const { email } = req.body;


    try {
        await sendEmail({
            email: email,
            subject: "Ecommerce Password Recovery",
            message: "Hello",
            html: "<b> Hello World ?</b>"
        });
        resp.status(200).json({
            success: true,
            message: `Email sent succesfully to ${email}`
        })


    } catch (err) {


        return resp.status(400).json({ success: false, error: err })
    }
}



//reset password :- 
exports.resetPassword = catchAsyncError(async (req, resp, next) => {
    //creating token hash
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    // 
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return next(new ErrorHandler("Reset Password Token is invalid or Has been expired ", 400))
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password doesn't match", 400))
    }

    user.password = req.body.password;
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;

    await user.save();

    sendToken(user, 200, resp);
});


//get user details :-

exports.getuserDetail = catchAsyncError(async (req, resp, next) => {

    const user = await User.findById(req.user.id);

    resp.status(200).json({
        success: true,
        user,
    })
})


//update user password :- 
exports.updatePassword = catchAsyncError(async (req, resp, next) => {

    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatch = user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatch) {
        return next(new ErrorHandler("Old Password is Incorrect", 400))
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password doesn't match", 400))
    }

    user.password = req.body.newPassword;

    await user.save();

    // sendToken(user, 200, resp);
    sendToken(user, 200, resp);

})


//update user profile :-
exports.updateProfile = catchAsyncError(async (req, resp, next) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    };


    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    resp.status(200).json({
        success: true,
    });

})

//get all users :- admin
exports.getAllUser = catchAsyncError(async (req, resp, next) => {

    const users = await User.find();

    resp.status(200).json({
        success: true,
        users
    })
})

//get single user detail :- admin
exports.getSingleUser = catchAsyncError(async (req, resp, next) => {

    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User doesn't exist with Id: ${req.params.id}`))
    }

    resp.status(200).json({
        success: true,
        user
    })
})

//update role :- admin
exports.updateUserRole = catchAsyncError(async (req, resp, next) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
    };
    console.log(newUserData)


    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    console.log("---------------------------------------")
    console.log(user)

    if (!user) {
        return next(new ErrorHandler(`User doesn't exist `, 400));
    }

    resp.status(200).json({
        success: true,
        role: user.role,
    });

})

//delete user :- admin
exports.deleteUser = catchAsyncError(async (req, resp, next) => {

    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User doesnt exist ${req.params.id} `, 400));
    }

    await user.deleteOne();

    resp.status(200).json({
        success: true,
        message: "User Deleted Successfully",
    });

})
