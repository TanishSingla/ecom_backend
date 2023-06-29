const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, "Please enter prodcut name"],
        trim: true,
    },
    description: {
        type: String,
        required: [true, "Please enter prodcut description"],
    },
    price: {
        type: Number,
        required: [true, "Please enter prodcut price"],
        maxLength: [8, "Price can't exceed 8 digits"]
    },
    ratings: {
        type: Number,
        default: 0,
    },
    images: [
        {
            public_id: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true
            }
        }
    ],
    category: {
        type: String,
        required: [true, "Please provide category of product"],
    },

    Stock: {
        type: Number,
        required: [true, "Please enter product stock"],
        default: 1,
    },

    numOfReviews: {
        type: Number,
        default: 0,
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
                requried: true,
            },
            name: {
                type: String,
                required: true,
            },
            rating: {
                type: Number,
                required: true,
            },
            comment: {
                type: String,
                required: true,
            }
        }
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        requried: true,
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }

});

module.exports = mongoose.model("Product", productSchema);