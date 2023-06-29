const express = require('express');
const app = express();
const errorMiddleware = require("./middleware/Error")
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(cookieParser());

// Route Import
const product = require("./routes/productRoute")
const user = require("./routes/userRoute");
const order = require("./routes/orderRoute");

app.get("/", (req, resp) => {
    resp.send("Server Running")
})

app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);


//middleware for error
app.use(errorMiddleware);

module.exports = app;