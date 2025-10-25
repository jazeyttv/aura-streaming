const Notification = require('../models/Notification');

// Helper function to create a notification
async function createNotification({
  recipientId,
  type,
  title,
  message,
  link = '',
  data = {}
}) {
  try {
    const notification = new Notification({
      recipientId,
      type,
      title,
      message,
      link,
      data
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
}

// Create follow notification
async function createFollowNotification(followerId, followerUsername, followedUserId) {
  return await createNotification({
    recipientId: followedUserId,
    type: 'follow',
    title: 'New Follower!',
    message: `${followerUsername} started following you`,
    link: `/profile/${followerUsername}`,
    data: {
      followerId,
      followerUsername
    }
  });
}

// Create stream live notification for all followers
async function createStreamLiveNotifications(streamerId, streamerUsername, followerIds) {
  try {
    const notifications = followerIds.map(followerId => ({
      recipientId: followerId,
      type: 'stream_live',
      title: `${streamerUsername} is live!`,
      message: `${streamerUsername} just started streaming`,
      link: `/stream/${streamerId}`,
      data: {
        streamerId,
        streamerUsername
      }
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    return notifications.length;
  } catch (error) {
    console.error('Create stream live notifications error:', error);
    return 0;
  }
}

// Emit notification to user via Socket.IO
function emitNotification(io, notification) {
  if (io) {
    // Emit to specific user room
    io.to(`user_${notification.recipientId}`).emit('new-notification', notification);
  }
}

module.exports = {
  createNotification,
  createFollowNotification,
  createStreamLiveNotifications,
  emitNotification
};

