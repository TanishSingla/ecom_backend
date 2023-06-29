const mongoose = require("mongoose");


const connectDatabase = () => {
    mongoose.connect(process.env.MONGO_URL, {
        useUnifiedTopology: true
    }).then((e) => {
        console.log(`MongoDb connected with Server ${e.connection.host}`)
    });
};

module.exports = connectDatabase;