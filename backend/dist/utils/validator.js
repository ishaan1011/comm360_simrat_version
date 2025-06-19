"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUsername = exports.validatePassword = exports.validateEmail = exports.validateObjectIdMiddleware = exports.validateObjectId = void 0;
const errorHandler_1 = require("./errorHandler");
const validateObjectId = (id) => {
    const ObjectId = require('mongoose').Types.ObjectId;
    return ObjectId.isValid(id);
};
exports.validateObjectId = validateObjectId;
const validateObjectIdMiddleware = (req, res, next) => {
    const { id } = req.params;
    if (!(0, exports.validateObjectId)(id)) {
        return next(new errorHandler_1.AppError('Invalid ID format', 400));
    }
    next();
};
exports.validateObjectIdMiddleware = validateObjectIdMiddleware;
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};
exports.validateEmail = validateEmail;
const validatePassword = (password) => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return re.test(password);
};
exports.validatePassword = validatePassword;
const validateUsername = (username) => {
    const re = /^[a-zA-Z0-9_]{3,20}$/;
    return re.test(username);
};
exports.validateUsername = validateUsername;
//# sourceMappingURL=validator.js.map