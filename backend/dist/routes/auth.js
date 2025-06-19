"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/google', auth_1.verifyGoogleToken, authController_1.handleGoogleAuth);
exports.default = router;
//# sourceMappingURL=auth.js.map