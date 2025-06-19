"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketHandlers = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const message_1 = require("./models/message");
const meeting_1 = require("./models/meeting");
const setupSocketHandlers = (io) => {
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
            socket.userId = decoded.id;
            next();
        }
        catch (error) {
            next(new Error('Authentication error'));
        }
    });
    io.on('connection', (socket) => {
        console.log('User connected:', socket.userId);
        socket.on('join_meeting', async (meetingId) => {
            socket.join(`meeting:${meetingId}`);
            socket.to(`meeting:${meetingId}`).emit('user_joined', {
                userId: socket.userId,
                timestamp: new Date()
            });
        });
        socket.on('leave_meeting', (meetingId) => {
            socket.leave(`meeting:${meetingId}`);
            socket.to(`meeting:${meetingId}`).emit('user_left', {
                userId: socket.userId,
                timestamp: new Date()
            });
        });
        socket.on('send_message', async (data) => {
            try {
                const message = await message_1.Message.create({
                    conversation: data.conversationId,
                    sender: socket.userId,
                    content: data.content,
                    type: 'text'
                });
                io.to(`conversation:${data.conversationId}`).emit('new_message', message);
            }
            catch (error) {
                console.error('Error sending message:', error);
            }
        });
        socket.on('meeting_status_update', async (data) => {
            try {
                const meeting = await meeting_1.Meeting.findByIdAndUpdate(data.meetingId, { status: data.status }, { new: true });
                if (meeting) {
                    io.to(`meeting:${data.meetingId}`).emit('meeting_updated', meeting);
                }
            }
            catch (error) {
                console.error('Error updating meeting status:', error);
            }
        });
        socket.on('participant_update', async (data) => {
            try {
                const meeting = await meeting_1.Meeting.findById(data.meetingId);
                if (meeting) {
                    const participant = meeting.participants.find((p) => p.user.toString() === data.participantId);
                    if (participant) {
                        participant.status = data.status;
                        await meeting.save();
                        io.to(`meeting:${data.meetingId}`).emit('participant_updated', {
                            participantId: data.participantId,
                            status: data.status
                        });
                    }
                }
            }
            catch (error) {
                console.error('Error updating participant status:', error);
            }
        });
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.userId);
        });
    });
};
exports.setupSocketHandlers = setupSocketHandlers;
//# sourceMappingURL=socket.js.map