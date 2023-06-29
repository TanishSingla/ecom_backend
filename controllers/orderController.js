const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

// create new order :- 
exports.newOrder = catchAsyncErrors(async (req, resp, next) => {

    const { shippingInfo, orderItems, paymentInfo, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user: req.user._id,
    });

    resp.status(201).json({
        success: true,
        order,
    })
})

//get a Single Order :- 
exports.getSingleOrder = catchAsyncErrors(async (req, resp, next) => {

    const order = await Order.findById(req.params.id)
        .populate("user", "name email");

    if (!order) {
        return next(new ErrorHandler("Order not found with this Id", 404));
    }
    resp.status(200).json({
        success: true,
        order,
    })
});

//get Order of logged in User:- 
exports.myOrders = catchAsyncErrors(async (req, resp, next) => {

    const orders = await Order.find({ user: req.user._id });


    resp.status(200).json({
        success: true,
        orders,
    })
})

//get all orders for --admin
exports.getAllOrders = catchAsyncErrors(async (req, resp, next) => {

    const orders = await Order.find();

    let totalAmount = 0;

    orders.forEach((order) => {
        totalAmount += order.totalPrice;
    });

    resp.status(200).json({
        success: true,
        totalAmount,
        orders,
    })
})

//Update Order Status --admin
exports.updateOrder = catchAsyncErrors(async (req, resp, next) => {

    const order = await Order.findById(req.params.id);

    if (!order) {
        return (new ErrorHandler("Order Not Found with the Given Id", 404));
    }

    if (order.orderStatus === 'Delivered') {
        return next(new ErrorHandler("You Have Already Delivered This Order ", 400));
    }

    //here we updating the stock :- 
    //as after deleivering the product we have to decrese the stock of that
    //product too. (so thats, why we are sending productId and product quantity)
    order.orderItems.forEach(async (o) => {
        await updateStock(o.product, o.quantity);
    })

    order.orderStatus = req.body.status;

    if (req.body.status === "Delivered") {
        order.deliveredAt = Date.now();
    }
    await order.save({ validateBeforeSave: false });

    resp.status(200).json({
        success: true,
    })
})

async function updateStock(id, quantity) {
    const product = await Product.findById(id);
    product.Stock -= quantity;
    await product.save({ validateBeforeSave: false });
}


// delete Order
exports.deleteOrder = catchAsyncErrors(async (req, resp, next) => {

    const order = Order.findById(req.params.id);

    if (!order) {
        return (new ErrorHandler("Order Not Found with the Given Id", 404));
    }
    await order.deleteOne();

    resp.status(200).json({
        success: true,
        message: "Order Deleted Succesfully",
    })
})
