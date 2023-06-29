const app = require("./app")
const dotenv = require("dotenv")
const connectDatabase = require("./config/database.js")



//Handling uncaught exception :- 
// ex :- if we are using any variable which is not declare.

process.on("uncaughtException", (err) => {
    console.log(`Error ${err.message}`);
    console.log("Shutting Down Server due to uncaughtException")
    process.exit(1);
})

//config
dotenv.config({ path: "./config/config.env" })


//connectdb
connectDatabase();

const server = app.listen(process.env.PORT, () => {
    console.log(`Server Runnisng of ${process.env.PORT}`);
})


//unhandled Promise Rejection :-
//ex :-  (in case if we have not give correct connection string on mongodb )

process.on("unhandledRejection", (err) => {
    console.log(`Error : ${err.message}`);
    console.log("Shutting Down Server due to Unhandled Promise Rejection");

    server.close(() => {
        process.exit(1);
    })
});