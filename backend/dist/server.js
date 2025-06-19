"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const meeting_1 = __importDefault(require("./routes/meeting"));
const message_1 = __importDefault(require("./routes/message"));
const profile_1 = __importDefault(require("./routes/profile"));
const socket_1 = require("./socket");
const database_1 = require("./config/database");
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3001',
        methods: ['GET', 'POST'],
        credentials: true
    }
});
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true
}));
app.use(express_1.default.json());
(0, database_1.connectToDatabase)().then(() => {
    console.log('Database connection established');
});
app.use('/api/auth', auth_1.default);
app.use('/api/meetings', meeting_1.default);
app.use('/api/messages', message_1.default);
app.use('/api/profile', profile_1.default);
(0, socket_1.setupSocketHandlers)(io);
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
process.on('SIGINT', async () => {
    await (0, database_1.closeDatabase)();
    process.exit(0);
});
//# sourceMappingURL=server.js.map