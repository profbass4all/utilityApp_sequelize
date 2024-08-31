const { Sequelize, DataTypes, Model, UUIDV4 } = require('sequelize');
const sequelize = require('../config/sequelize')
const Wallet = require('./wallet_models')

class User extends Model {}

User.init(
  {
    // Model attributes are defined here
    sn: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        unique: true,
    },
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        unique: true,
        defaultValue: UUIDV4,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email:{
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate:{
            isEmail: true,
        }
    },
    city:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    nin:{
        type: DataTypes.BIGINT(10),
        unique: true,
        allowNull: false,
    },
    whatsapp_no:{
        type: DataTypes.BIGINT(11),
        unique: true,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('customer', 'admin'),
        allowNull: false,
        defaultValue: 'customer'
    },
    is_email_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    hash: {
        type: DataTypes.TEXT,
        allowNull: false,
        
    },
    salt: {
        type: DataTypes.TEXT,
        allowNull: false,
    }
},
  {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'User', // We need to choose the model name
  },
);

User.hasOne(Wallet , {
    foreignKey: {
        allowNull: false, //
    }, //
})

Wallet.belongsTo(User)

// the defined model is the class itself
console.log(User === sequelize.models.User); // true

module.exports = User;