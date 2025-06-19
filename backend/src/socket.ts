import { Server } from 'socket.io';
import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Message } from './models/message';
import { Meeting } from './models/meeting';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

type ParticipantStatus = 'active' | 'muted' | 'left';

export const setupSocketHandlers = (io: Server) => {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret') as { id: string };
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log('User connected:', socket.userId);

    // Join meeting room
    socket.on('join_meeting', async (meetingId: string) => {
      socket.join(`meeting:${meetingId}`);
      
      // Notify others that user joined
      socket.to(`meeting:${meetingId}`).emit('user_joined', {
        userId: socket.userId,
        timestamp: new Date()
      });
    });

    // Leave meeting room
    socket.on('leave_meeting', (meetingId: string) => {
      socket.leave(`meeting:${meetingId}`);
      
      // Notify others that user left
      socket.to(`meeting:${meetingId}`).emit('user_left', {
        userId: socket.userId,
        timestamp: new Date()
      });
    });

    // Handle real-time messages
    socket.on('send_message', async (data: { conversationId: string; content: string }) => {
      try {
        const message = await Message.create({
          conversation: data.conversationId,
          sender: socket.userId,
          content: data.content,
          type: 'text'
        });

        // Emit to all users in the conversation
        io.to(`conversation:${data.conversationId}`).emit('new_message', message);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    // Handle meeting status updates
    socket.on('meeting_status_update', async (data: { meetingId: string; status: string }) => {
      try {
        const meeting = await Meeting.findByIdAndUpdate(
          data.meetingId,
          { status: data.status },
          { new: true }
        );

        if (meeting) {
          io.to(`meeting:${data.meetingId}`).emit('meeting_updated', meeting);
        }
      } catch (error) {
        console.error('Error updating meeting status:', error);
      }
    });

    // Handle participant updates
    socket.on('participant_update', async (data: { meetingId: string; participantId: string; status: ParticipantStatus }) => {
      try {
        const meeting = await Meeting.findById(data.meetingId);
        if (meeting) {
          const participant = meeting.participants.find((p) => 
            p.user.toString() === data.participantId
          );
          if (participant) {
            participant.status = data.status;
            await meeting.save();
            io.to(`meeting:${data.meetingId}`).emit('participant_updated', {
              participantId: data.participantId,
              status: data.status
            });
          }
        }
      } catch (error) {
        console.error('Error updating participant status:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.userId);
    });
  });
}; 