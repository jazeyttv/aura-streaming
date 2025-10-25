const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Stream = require('../models/Stream');

// Search users and live streams
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({ users: [], streams: [] });
    }

    const searchRegex = new RegExp(q, 'i');

    // Search users (limit 10)
    const users = await User.find({
      $or: [
        { username: searchRegex },
        { displayName: searchRegex }
      ]
    })
      .select('username displayName avatar isStreamer isPartner isAffiliate followers role')
      .limit(10)
      .lean();

    // Add follower count
    const usersWithCounts = users.map(user => ({
      ...user,
      followerCount: user.followers?.length || 0
    }));

    // Search live streams (limit 10)
    const streams = await Stream.find({
      isLive: true,
      $or: [
        { title: searchRegex },
        { category: searchRegex }
      ]
    })
      .populate('streamer', 'username displayName avatar isPartner isAffiliate role')
      .limit(10)
      .lean();

    console.log(`🔍 Search query: "${q}" - Found ${users.length} users, ${streams.length} streams`);

    res.json({
      users: usersWithCounts,
      streams
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

