const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

let userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Enter Your Name"],
        maxLength: [30, "Name can not exceed 30 characters"],
        minLength: [4, "Your Name Should have atlease 4 characters"]
    },
    email: {
        type: String,
        required: [true, "Please Enter Your Email"],
        unique: true,
        validate: [validator.isEmail, "Please Enter a valid Email"]
    },
    password: {
        type: String,
        required: [true, "Please Enter Your Password"],
        minLength: [8, "Your Password Should be greater than 8 characters"],
        select: false,
    },
    avatar: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true
        }
    },
    role: {
        type: String,
        default: "user",
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,
});

//password encryption :-
// The Mongoose Schema API pre() method is used to add a pre-hook to the mongoose Schema methods and can be used to perform pre Schema method operations. 
userSchema.pre("save", async function (next) {

    if (!this.isModified("password")) {
        console.log("called")
        return next();
    }

    this.password = await bcrypt.hash(this.password, 10);
});

//JWT Token
userSchema.methods.getJWTToken = function () {

    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    })

}

//compareing passwords for login :- 
userSchema.methods.comparePassword = async function (currpassword) {
    //this.password means userSchema.password , password which is saved in the database.
    return await bcrypt.compare(currpassword, this.password);
}


//generating resent password token :-
userSchema.methods.getResetPasswordToken = function () {

    //generating token 
    const resetToken = crypto.randomBytes(20).toString("hex");

    //hashing and add to userSchema
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    return resetToken;
};


// The crypto module provides a way of handling encrypted data. 
module.exports = mongoose.model("User", userSchema);