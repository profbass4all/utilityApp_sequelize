const { Sequelize, DataTypes, Model, UUIDV4 } = require('sequelize');
const sequelize = require('../config/sequelize')
const User = require('./users_models')

class Wallet extends Model {}

Wallet.init(
  {
    // Model attributes are defined here
    sn: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        unique: true,
    },
    wallet_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        unique: true,
        defaultValue: UUIDV4,
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
    }
    
    
},
  {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'Wallet', // We need to choose the model name
  },
);



// the defined model is the class itself
console.log(Wallet === sequelize.models.Wallet); // true

module.exports = Wallet;