const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const Stream = require('../models/Stream');
const User = require('../models/User');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const { createNotification, emitNotification } = require('../utils/notifications');

// Submit a report
router.post('/submit', auth, async (req, res) => {
  try {
    const { streamId, reason, additionalInfo } = req.body;
    
    // Get stream and streamer info
    const stream = await Stream.findById(streamId);
    if (!stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }
    
    // Check if user already reported this stream
    const existingReport = await Report.findOne({
      reportedBy: req.userId,
      stream: streamId,
      status: 'pending'
    });
    
    if (existingReport) {
      return res.status(400).json({ error: 'You have already reported this stream' });
    }
    
    // Create report
    const report = new Report({
      reportedBy: req.userId,
      stream: streamId,
      streamer: stream.streamer,
      reason,
      additionalInfo: additionalInfo || ''
    });
    
    await report.save();
    
    console.log(`📢 New report created for stream ${streamId} by user ${req.userId}`);
    
    res.json({
      success: true,
      message: 'Report submitted successfully. Our team will review it shortly.',
      reportId: report._id
    });
  } catch (error) {
    console.error('Submit report error:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

// Get all reports (admin only)
router.get('/admin/all', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { status } = req.query;
    const filter = status && status !== 'all' ? { status } : {};
    
    const reports = await Report.find(filter)
      .populate('reportedBy', 'username avatar')
      .populate('streamer', 'username avatar')
      .populate('stream', 'title category')
      .populate('reviewedBy', 'username')
      .sort({ createdAt: -1 });
    
    res.json(reports);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Accept report and delete stream (admin only)
router.post('/admin/:reportId/accept', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { adminNotes } = req.body;
    const report = await Report.findById(req.params.reportId)
      .populate('streamer', 'username')
      .populate('stream');
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    if (report.status !== 'pending') {
      return res.status(400).json({ error: 'Report has already been reviewed' });
    }
    
    // Update report status
    report.status = 'accepted';
    report.reviewedBy = req.userId;
    report.reviewedAt = new Date();
    report.adminNotes = adminNotes || '';
    await report.save();
    
    // Delete the stream
    if (report.stream) {
      await Stream.findByIdAndDelete(report.stream._id);
      console.log(`🗑️ Stream ${report.stream._id} deleted due to accepted report`);
    }
    
    // Send notification to streamer
    await createNotification({
      userId: report.streamer._id,
      type: 'stream_removed',
      message: `Your stream was removed due to: ${report.reason}`,
      data: {
        reportId: report._id,
        reason: report.reason
      }
    });
    
    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      io.to(report.streamer._id.toString()).emit('notification', {
        type: 'stream_removed',
        message: `Your stream was removed due to: ${report.reason}`,
        timestamp: new Date()
      });
    }
    
    res.json({
      success: true,
      message: 'Report accepted and stream removed',
      report
    });
  } catch (error) {
    console.error('Accept report error:', error);
    res.status(500).json({ error: 'Failed to accept report' });
  }
});

// Reject report (admin only)
router.post('/admin/:reportId/reject', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { adminNotes } = req.body;
    const report = await Report.findById(req.params.reportId);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    if (report.status !== 'pending') {
      return res.status(400).json({ error: 'Report has already been reviewed' });
    }
    
    // Update report status
    report.status = 'rejected';
    report.reviewedBy = req.userId;
    report.reviewedAt = new Date();
    report.adminNotes = adminNotes || '';
    await report.save();
    
    console.log(`✖️ Report ${report._id} rejected by admin ${user.username}`);
    
    res.json({
      success: true,
      message: 'Report rejected',
      report
    });
  } catch (error) {
    console.error('Reject report error:', error);
    res.status(500).json({ error: 'Failed to reject report' });
  }
});

module.exports = router;

