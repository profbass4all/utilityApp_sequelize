const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize= require('../config/sequelize')


class Otp extends Model {}

Otp.init(
  {
    // Model attributes are defined here
    sn: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      references: {
        model: sequelize.models.User,
        key: 'email', // this is the key in the customer model that the otp will reference to. 'email' is the column name in the customer model.
        unique: true, // ensures that each otp is unique for each customer.
      }
      // allowNull defaults to true
    },
    otp_code:{
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    }
  },
  {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'Otp', // We need to choose the model name
  },
);

// the defined model is the class itself
// console.log(otp === sequelize.models.otp); // true

module.exports = Otp