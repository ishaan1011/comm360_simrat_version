"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const profileController_1 = require("../controllers/profileController");
const router = (0, express_1.Router)();
router.use(auth_1.verifyGoogleToken);
router.get('/', profileController_1.getProfile);
router.put('/', profileController_1.updateProfile);
router.put('/settings', profileController_1.updateSettings);
router.put('/notifications', profileController_1.updateNotificationPreferences);
exports.default = router;
//# sourceMappingURL=profile.js.map