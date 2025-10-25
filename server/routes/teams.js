const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all teams
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find({ isPublic: true })
      .populate('owner', 'username avatar isPartner')
      .populate('members', 'username avatar isPartner')
      .sort({ createdAt: -1 });
    
    res.json(teams);
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// Get team by name
router.get('/:teamName', async (req, res) => {
  try {
    const team = await Team.findOne({ name: req.params.teamName })
      .populate('owner', 'username displayName avatar banner bio isPartner')
      .populate('members', 'username displayName avatar isPartner followers');
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    res.json(team);
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

// Create team (partners only)
router.post('/create', auth, async (req, res) => {
  try {
    const { name, displayName, description, banner, logo } = req.body;
    
    // Check if user is partner
    const user = await User.findById(req.userId);
    if (!user || !user.isPartner) {
      return res.status(403).json({ error: 'Only partners can create teams' });
    }
    
    // Check if user already owns a team
    const existingTeam = await Team.findOne({ owner: req.userId });
    if (existingTeam) {
      return res.status(400).json({ error: 'You already own a team. You can only own one team.' });
    }
    
    // Validate name
    if (!name || name.length < 3 || name.length > 30) {
      return res.status(400).json({ error: 'Team name must be between 3 and 30 characters' });
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
      return res.status(400).json({ error: 'Team name can only contain letters, numbers, hyphens, and underscores' });
    }
    
    // Check if team name is taken
    const nameExists = await Team.findOne({ name });
    if (nameExists) {
      return res.status(400).json({ error: 'Team name is already taken' });
    }
    
    // Create team
    const team = new Team({
      name,
      displayName: displayName || name,
      description: description || '',
      banner: banner || '',
      logo: logo || '',
      owner: req.userId,
      members: [req.userId] // Owner is automatically a member
    });
    
    await team.save();
    
    await team.populate('owner', 'username avatar isPartner');
    await team.populate('members', 'username avatar isPartner');
    
    res.json({
      success: true,
      message: 'Team created successfully',
      team
    });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// Update team
router.put('/:teamName', auth, async (req, res) => {
  try {
    const { displayName, description, banner, logo, isPublic } = req.body;
    
    const team = await Team.findOne({ name: req.params.teamName });
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    // Check if user is owner
    if (team.owner.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only the team owner can update the team' });
    }
    
    // Update fields
    if (displayName) team.displayName = displayName;
    if (description !== undefined) team.description = description;
    if (banner !== undefined) team.banner = banner;
    if (logo !== undefined) team.logo = logo;
    if (isPublic !== undefined) team.isPublic = isPublic;
    
    await team.save();
    
    await team.populate('owner', 'username avatar isPartner');
    await team.populate('members', 'username avatar isPartner');
    
    res.json({
      success: true,
      message: 'Team updated successfully',
      team
    });
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({ error: 'Failed to update team' });
  }
});

// Invite user to team
router.post('/:teamName/invite', auth, async (req, res) => {
  try {
    const { username } = req.body;
    
    const team = await Team.findOne({ name: req.params.teamName });
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    // Check if user is owner
    if (team.owner.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only the team owner can invite members' });
    }
    
    // Find user to invite
    const userToInvite = await User.findOne({ username });
    if (!userToInvite) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if user is already a member
    if (team.members.includes(userToInvite._id)) {
      return res.status(400).json({ error: 'User is already a member of this team' });
    }
    
    // Check if user already has a pending invite
    const existingInvite = team.pendingInvites.find(
      inv => inv.userId.toString() === userToInvite._id.toString()
    );
    if (existingInvite) {
      return res.status(400).json({ error: 'User already has a pending invite' });
    }
    
    // Add invite
    team.pendingInvites.push({
      userId: userToInvite._id,
      invitedBy: req.userId,
      invitedAt: new Date()
    });
    
    await team.save();
    
    res.json({
      success: true,
      message: `Invitation sent to ${username}`
    });
  } catch (error) {
    console.error('Invite user error:', error);
    res.status(500).json({ error: 'Failed to send invitation' });
  }
});

// Get user's pending invites
router.get('/invites/pending', auth, async (req, res) => {
  try {
    const teams = await Team.find({
      'pendingInvites.userId': req.userId
    })
    .populate('owner', 'username avatar')
    .populate('pendingInvites.invitedBy', 'username');
    
    const invites = teams.map(team => ({
      teamId: team._id,
      teamName: team.name,
      teamDisplayName: team.displayName,
      teamLogo: team.logo,
      owner: team.owner,
      invitedBy: team.pendingInvites.find(inv => inv.userId.toString() === req.userId)?.invitedBy,
      invitedAt: team.pendingInvites.find(inv => inv.userId.toString() === req.userId)?.invitedAt
    }));
    
    res.json(invites);
  } catch (error) {
    console.error('Get invites error:', error);
    res.status(500).json({ error: 'Failed to fetch invites' });
  }
});

// Accept team invite
router.post('/:teamName/accept', auth, async (req, res) => {
  try {
    const team = await Team.findOne({ name: req.params.teamName });
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    // Find invite
    const inviteIndex = team.pendingInvites.findIndex(
      inv => inv.userId.toString() === req.userId
    );
    
    if (inviteIndex === -1) {
      return res.status(404).json({ error: 'No pending invite found' });
    }
    
    // Add to members and remove from pending
    team.members.push(req.userId);
    team.pendingInvites.splice(inviteIndex, 1);
    
    await team.save();
    
    res.json({
      success: true,
      message: `You joined ${team.displayName}!`
    });
  } catch (error) {
    console.error('Accept invite error:', error);
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
});

// Decline team invite
router.post('/:teamName/decline', auth, async (req, res) => {
  try {
    const team = await Team.findOne({ name: req.params.teamName });
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    // Find and remove invite
    const inviteIndex = team.pendingInvites.findIndex(
      inv => inv.userId.toString() === req.userId
    );
    
    if (inviteIndex === -1) {
      return res.status(404).json({ error: 'No pending invite found' });
    }
    
    team.pendingInvites.splice(inviteIndex, 1);
    await team.save();
    
    res.json({
      success: true,
      message: 'Invitation declined'
    });
  } catch (error) {
    console.error('Decline invite error:', error);
    res.status(500).json({ error: 'Failed to decline invitation' });
  }
});

// Remove member from team
router.delete('/:teamName/members/:username', auth, async (req, res) => {
  try {
    const team = await Team.findOne({ name: req.params.teamName });
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    // Check if user is owner
    if (team.owner.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only the team owner can remove members' });
    }
    
    // Find user to remove
    const userToRemove = await User.findOne({ username: req.params.username });
    if (!userToRemove) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Can't remove owner
    if (userToRemove._id.toString() === team.owner.toString()) {
      return res.status(400).json({ error: 'Cannot remove the team owner' });
    }
    
    // Remove from members
    team.members = team.members.filter(
      memberId => memberId.toString() !== userToRemove._id.toString()
    );
    
    await team.save();
    
    res.json({
      success: true,
      message: `${req.params.username} removed from team`
    });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

// Leave team
router.post('/:teamName/leave', auth, async (req, res) => {
  try {
    const team = await Team.findOne({ name: req.params.teamName });
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    // Can't leave if you're the owner
    if (team.owner.toString() === req.userId) {
      return res.status(400).json({ error: 'Team owner cannot leave. Delete the team or transfer ownership first.' });
    }
    
    // Remove from members
    team.members = team.members.filter(
      memberId => memberId.toString() !== req.userId
    );
    
    await team.save();
    
    res.json({
      success: true,
      message: 'You left the team'
    });
  } catch (error) {
    console.error('Leave team error:', error);
    res.status(500).json({ error: 'Failed to leave team' });
  }
});

// Delete team
router.delete('/:teamName', auth, async (req, res) => {
  try {
    const team = await Team.findOne({ name: req.params.teamName });
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    // Check if user is owner
    if (team.owner.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only the team owner can delete the team' });
    }
    
    await Team.deleteOne({ _id: team._id });
    
    res.json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

module.exports = router;

