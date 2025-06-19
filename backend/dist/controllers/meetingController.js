"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaveMeeting = exports.joinMeeting = exports.getUserMeetings = exports.deleteMeeting = exports.updateMeeting = exports.getMeeting = exports.createMeeting = void 0;
const meetingService_1 = require("../services/meetingService");
const meetingService = new meetingService_1.MeetingService();
const createMeeting = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const meetingData = {
            ...req.body,
            hostId: req.user.email,
            participants: [req.user.email],
        };
        const meeting = await meetingService.createMeeting(meetingData);
        res.status(201).json(meeting);
    }
    catch (error) {
        console.error('Create meeting error:', error);
        res.status(500).json({ error: 'Failed to create meeting' });
    }
};
exports.createMeeting = createMeeting;
const getMeeting = async (req, res) => {
    try {
        const { id } = req.params;
        const meeting = await meetingService.getMeeting(id);
        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found' });
        }
        res.json(meeting);
    }
    catch (error) {
        console.error('Get meeting error:', error);
        res.status(500).json({ error: 'Failed to get meeting' });
    }
};
exports.getMeeting = getMeeting;
const updateMeeting = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const { id } = req.params;
        const meeting = await meetingService.getMeeting(id);
        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found' });
        }
        if (meeting.hostId !== req.user.email) {
            return res.status(403).json({ error: 'Not authorized to update this meeting' });
        }
        const updatedMeeting = await meetingService.updateMeeting(id, req.body);
        res.json(updatedMeeting);
    }
    catch (error) {
        console.error('Update meeting error:', error);
        res.status(500).json({ error: 'Failed to update meeting' });
    }
};
exports.updateMeeting = updateMeeting;
const deleteMeeting = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const { id } = req.params;
        const meeting = await meetingService.getMeeting(id);
        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found' });
        }
        if (meeting.hostId !== req.user.email) {
            return res.status(403).json({ error: 'Not authorized to delete this meeting' });
        }
        await meetingService.deleteMeeting(id);
        res.status(204).send();
    }
    catch (error) {
        console.error('Delete meeting error:', error);
        res.status(500).json({ error: 'Failed to delete meeting' });
    }
};
exports.deleteMeeting = deleteMeeting;
const getUserMeetings = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const meetings = await meetingService.getUserMeetings(req.user.email);
        res.json(meetings);
    }
    catch (error) {
        console.error('Get user meetings error:', error);
        res.status(500).json({ error: 'Failed to get user meetings' });
    }
};
exports.getUserMeetings = getUserMeetings;
const joinMeeting = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const { id } = req.params;
        const meeting = await meetingService.getMeeting(id);
        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found' });
        }
        await meetingService.addParticipant(id, req.user.email);
        res.json({ message: 'Successfully joined meeting' });
    }
    catch (error) {
        console.error('Join meeting error:', error);
        res.status(500).json({ error: 'Failed to join meeting' });
    }
};
exports.joinMeeting = joinMeeting;
const leaveMeeting = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const { id } = req.params;
        const meeting = await meetingService.getMeeting(id);
        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found' });
        }
        await meetingService.removeParticipant(id, req.user.email);
        res.json({ message: 'Successfully left meeting' });
    }
    catch (error) {
        console.error('Leave meeting error:', error);
        res.status(500).json({ error: 'Failed to leave meeting' });
    }
};
exports.leaveMeeting = leaveMeeting;
//# sourceMappingURL=meetingController.js.map