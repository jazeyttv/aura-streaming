const express = require('express');
const router = express.Router();
const WatchHistory = require('../models/WatchHistory');
const User = require('../models/User');

// Get top watchers for a specific stream (current session)
router.get('/stream/:streamId/top-watchers', async (req, res) => {
  try {
    const { streamId } = req.params;
    
    // Get current stream viewers with their watch time from socket connections
    const viewers = global.streamViewers.get(streamId);
    const watchTimes = global.streamWatchTimes?.get(streamId) || new Map();
    
    if (!viewers || viewers.size === 0) {
      return res.json([]);
    }
    
    // Convert to array with watch time
    const viewersArray = Array.from(viewers).map(socketId => {
      const watchTime = watchTimes.get(socketId) || 0;
      return { socketId, watchTime };
    });
    
    // Sort by watch time descending
    viewersArray.sort((a, b) => b.watchTime - a.watchTime);
    
    // Get top 10 and fetch user data
    const topViewers = viewersArray.slice(0, 10);
    
    // Get socket info to map to users
    const io = req.app.get('io');
    const leaderboard = [];
    
    for (const viewer of topViewers) {
      const socket = io.sockets.sockets.get(viewer.socketId);
      if (socket && socket.userId) {
        try {
          const user = await User.findById(socket.userId).select('username displayName avatar role isPartner');
          if (user) {
            leaderboard.push({
              username: user.username,
              displayName: user.displayName || user.username,
              avatar: user.avatar,
              role: user.role,
              isPartner: user.isPartner,
              watchTime: Math.floor(viewer.watchTime / 1000), // Convert ms to seconds
              watchTimeFormatted: formatWatchTime(Math.floor(viewer.watchTime / 1000))
            });
          }
        } catch (err) {
          console.error('Error fetching user:', err);
        }
      }
    }
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching stream leaderboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all-time top watchers for a streamer
router.get('/streamer/:streamerId/all-time', async (req, res) => {
  try {
    const { streamerId } = req.params;
    
    // Aggregate watch history to get top watchers
    const topWatchers = await WatchHistory.aggregate([
      { $match: { streamerId: require('mongoose').Types.ObjectId(streamerId) } },
      {
        $group: {
          _id: '$userId',
          totalWatchTime: { $sum: '$watchDuration' }
        }
      },
      { $sort: { totalWatchTime: -1 } },
      { $limit: 10 }
    ]);
    
    // Fetch user details
    const leaderboard = await Promise.all(
      topWatchers.map(async (watcher) => {
        const user = await User.findById(watcher._id).select('username displayName avatar role isPartner');
        return {
          username: user?.username || 'Unknown',
          displayName: user?.displayName || user?.username || 'Unknown',
          avatar: user?.avatar,
          role: user?.role,
          isPartner: user?.isPartner,
          watchTime: watcher.totalWatchTime * 60, // Convert minutes to seconds
          watchTimeFormatted: formatWatchTime(watcher.totalWatchTime * 60)
        };
      })
    );
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching all-time leaderboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to format watch time
function formatWatchTime(seconds) {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
}

module.exports = router;

