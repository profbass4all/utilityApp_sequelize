const Joi = require('joi');


const validateCustomer = (data)=>{
    const schema = Joi.object({
        firstName: Joi.string().required().pattern(new RegExp('^[a-zA-Z]+[a-zA-Z]$')),
        lastName: Joi.string().required().pattern(new RegExp('^[a-zA-Z]+[a-zA-Z]$')),
        email: Joi.string().email().required(),
        city: Joi.string().required().pattern(new RegExp('^[a-zA-Z]+[a-zA-Z]$')),
        password: Joi.string().required().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
        confirmedPassword: Joi.ref('password'),
        nin: Joi.string().pattern(/^\d{10}$/).required(),
        whatsapp_no: Joi.string().pattern(/^\d{11}$/).required(),
    });

    return schema.validate(data)
}

const validateUpdateCustomer = (data)=>{
    const schema = Joi.object({
        firstName: Joi.string().pattern(new RegExp('^[a-zA-Z]+[a-zA-Z]$')),
        lastName: Joi.string().pattern(new RegExp('^[a-zA-Z]+[a-zA-Z]$')),
        city: Joi.string().pattern(new RegExp('^[a-zA-Z]+[a-zA-Z]$')),
        nin: Joi.string().pattern(/^\d{10}$/),
        whatsapp_no: Joi.string().pattern(/^\d{11}$/),
    });

    return schema.validate(data)
}


module.exports = {validateCustomer, validateUpdateCustomer}