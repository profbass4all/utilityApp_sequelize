const { Sequelize, DataTypes, Model, UUIDV4 } = require('sequelize');
const sequelize = require('../config/sequelize')

class Transaction extends Model {}

Transaction.init(
  {
    // Model attributes are defined here
    sn: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        unique: true,
    },
    transaction_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        unique: true,
        defaultValue: UUIDV4,
    },
    wallet_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    transaction_reference: {
        type: DataTypes.STRING,
        allowNull: true
    },
    transaction_gateway_response:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    transaction_paid_at:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    transaction_channel:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    transaction_ip_address:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    amount:{
        type: DataTypes.DECIMAL(),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            min: 0.00,
            max: 1000000000000.00, // 1,000,000,000,000
            // If amount is not a number or is out of range, throw an error
            isDecimal: function(value) {
                if (isNaN(value)) {
                    throw new Error('Amount must be a decimal number');
                }
            }

        },
    },
    // Add more fields here if needed
    currency: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'NGN',
        validate: {
            isIn: [['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'BRL', 'CNY', 'INR', 'KRW', 'MXN', 'MYR', 'NZD','NGN','PHP', 'PLN', 'RUB', 'SGD', 'THB', 'TRY', 'ZAR']],
        },
    },
    transaction_type:{
        type: DataTypes.ENUM('funding_wallet', 'buy_airtime', 'buy_phcn_token', 'subscribe_dstv', 'subscribe_gotv'),
        allowNull: false,
        validate:{
            isIn: [['funding_wallet', 'buy_airtime', 'buy_phcn_token', 'subscribe_dstv', 'subscribe_gotv']]
        }
    },
    transaction_status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed'),
        allowNull: false,
        validate:{
            isIn: [['pending', 'completed', 'failed']]
        }
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    description:{
        type: DataTypes.TEXT,
        allowNull: true,
    },
    
},
  {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'Transaction', // We need to choose the model name
  },
);

// the defined model is the class itself
console.log(Transaction === sequelize.models.Transaction); // true

module.exports = Transaction;