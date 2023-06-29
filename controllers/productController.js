const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler")
const catchAsyncError = require("../middleware/catchAsyncErrors")
const ApiFeatures = require("../utils/apiFeatures");

//creating product -- only fr admin
exports.createProduct = catchAsyncError(async (req, resp) => {

    req.body.user = req.user.id;

    const product = await Product.create(req.body);

    resp.status(201).json({
        success: true,
        product
    });
});

//get all product

exports.getAllProducts = catchAsyncError(async (req, resp) => {

    const resultPerPage = 5;
    const productCount = await Product.countDocuments();

    const apiFeature = new ApiFeatures(Product.find(), req.query).search().filter().pagination(resultPerPage);
    const product = await apiFeature.query;

    resp.status(200).json({
        success: true,
        product,
        productCount
    })
});


//update product -- for admin

exports.updateProduct = catchAsyncError(async (req, resp) => {

    let product = await Product.findById(req.params.id);

    if (!product) {
        return resp.status(500).json({
            success: false,
            message: "Product Doesn't exists",
        })
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    resp.status(200).json({
        success: true,
        product
    })
});


//delete product --admin

exports.deleteProduct = catchAsyncError(async (req, resp, next) => {

    const product = await Product.findById(req.params.id);

    if (!product) {
        return resp.status(500).json({
            success: false,
            message: "Product not found",
        })
    }

    await Product.deleteOne();

    resp.status(200).json({
        success: true,
        message: "Product Deleted Successfully"
    });
});


//get single product details

exports.getProductDetails = catchAsyncError(async (req, resp, next) => {

    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    resp.status(200).json({
        success: true,
        product,
    });
});

// Create New Review or Update the Review
exports.createProductReview = catchAsyncError(async (req, resp, next) => {

    const { rating, comment, productId } = req.body;
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    };

    const product = await Product.findById(productId);
    const isReviewed = product.reviews.find((rev) => rev.user.toString() === req.user._id.toString());

    if (isReviewed) {
        product.reviews.forEach(rev => {
            if (rev.user.toString() === req.user._id.toString())
                rev.rating = rating;
            rev.comment = comment;
        })
    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    let avg = 0;
    product.reviews.forEach(rev => {
        avg += rev.rating
    });

    product.ratings = avg / (product.reviews.length);

    await product.save({ validateBeforeSave: false });

    resp.status(200).json({
        success: true,
    })
})

exports.getProductsReviews = catchAsyncError(async (req, resp, next) => {
    const product = await Product.findById(req.query.id);

    if (!product) {
        return next(new ErrorHandler("Product not Found", 404));
    }
    resp.status(200).json({
        success: true,
        reviews: product.reviews,
    })

})

//delete review
exports.deleteReview = catchAsyncError(async (req, resp, next) => {
    const product = await Product.findById(req.query.productId);

    if (!product) {
        return next(new ErrorHandler("Product not Found bbom", 404));
    }

    const reviews = product.reviews.filter(rev => rev._id.toString() !== req.query.id.toString());

    let avg = 0;
    reviews.forEach(rev => {
        avg += rev.rating
    });

    const ratings = avg / (reviews.length);

    const numOfReviews = reviews.length;

    await Product.findByIdAndUpdate(req.query.productId, { reviews, ratings, numOfReviews }
        , {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        })

    resp.status(200).json({
        success: true,
    })

})