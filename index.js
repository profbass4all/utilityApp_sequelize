require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const sequelize = require('./config/sequelize');
const User = require('./models/users_models');
const Otp = require('./models/otp_models');
const Wallet = require('./models/wallet_models');
const Transaction = require('./models/transaction_models');
const port = process.env.APP_PORT || 1112
const UserRouter = require('./routes/users_routes')
const walletRouter = require('./routes/wallet_routes'); 
const transactionRouter = require('./routes/transactions_routes'); 
const airtimeRoutes = require('./routes/airtime_routes'); 

// Middleware to parse JSON request bodies

app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}))
app.use(UserRouter)
app.use(walletRouter);
app.use(transactionRouter)
app.use(airtimeRoutes)

//creating connection with the database using sequelize
try {
    const main = async()=>{
        await sequelize.authenticate();

        //creating tables if they don't exist
        await sequelize.sync();
        console.log('Connection has been established successfully.');
        app.listen(port, ()=>{
        console.log(`Server started on port ${port}`);
    })  
}
    main();
} catch (error) {
    console.error('unexpected error')
}


