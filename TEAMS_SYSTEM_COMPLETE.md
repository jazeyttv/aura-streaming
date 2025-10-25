# Teams System - Complete Implementation

## How to Use Partner Team Pages

### For Partners Creating a Team:

1. **Navigate to Settings**
   - Click your profile icon → Settings
   - Look for the "Team" tab (only visible if you're a Partner)

2. **Create Your Team**
   - Click the "Create Team" button
   - Fill in the required information:
     - **Team Name (URL)**: Unique identifier (letters, numbers, hyphens, underscores only)
       - Example: `elite-squad` becomes `yoursite.com/team/elite-squad`
     - **Display Name**: How your team appears to viewers
     - **Description**: Tell viewers about your team
     - **Banner Image**: Upload or paste URL for team banner
     - **Logo Image**: Upload or paste URL for team logo

3. **Invite Members**
   - After creating your team, scroll to "Invite Members" section
   - Enter a username and click "Invite"
   - Track pending invitations in the "Pending Invites" section
   - Cancel invites anytime by clicking the X next to a username

4. **Manage Your Team**
   - **Update Team Info**: Edit display name, description, banner, and logo
   - **View Team Page**: Click "View Team Page" to see how it looks to viewers
   - **Remove Members**: Click the trash icon next to any member (except yourself as owner)
   - **Delete Team**: Use the danger zone at the bottom (cannot be undone)

### For Users Receiving Team Invitations:

1. **View Invitations**
   - Go to Settings → Notifications tab
   - Team invitations appear at the top
   - See team name, logo, and who invited you

2. **Accept or Decline**
   - **Accept**: Click the "Accept" button to join the team
   - **Decline**: Click the "Decline" button to reject the invitation
   - Both actions remove the invitation from your list

3. **After Joining**
   - Your profile will display the team badge
   - You'll appear on the team's public page
   - Navigate to the team page at `/team/[team-name]`

### Team Page Features:

The public team page (`/team/[team-name]`) displays:
- Custom banner image
- Team logo
- Team description
- Owner information
- All team members with their avatars and partner badges
- Member follower counts
- Links to each member's profile

### Technical Details:

#### Backend Routes:
- `POST /api/teams/create` - Create a new team (partners only)
- `GET /api/teams/my-team` - Get current user's owned team
- `GET /api/teams/:teamName` - Get team by name (public)
- `GET /api/teams/invites/pending` - Get user's pending invitations
- `PUT /api/teams/:teamName` - Update team (owner only)
- `POST /api/teams/:teamName/invite` - Invite a user (owner only)
- `POST /api/teams/:teamName/accept` - Accept team invitation
- `POST /api/teams/:teamName/decline` - Decline team invitation
- `POST /api/teams/:teamName/cancel-invite` - Cancel pending invite (owner only)
- `POST /api/teams/:teamName/remove-member` - Remove team member (owner only)
- `POST /api/teams/:teamName/leave` - Leave a team
- `DELETE /api/teams/:teamName` - Delete team (owner only)

#### Frontend Components:
- **TeamManager**: Full team creation and management UI in Settings
- **TeamInvites**: Invitation notification and acceptance UI
- **TeamDisplay**: Shows team badge on user profiles
- **TeamPage**: Public-facing team profile page

#### Database Schema:
```javascript
Team {
  name: String (unique, URL-friendly)
  displayName: String
  description: String
  banner: String (image URL)
  logo: String (image URL)
  owner: ObjectId (ref: User)
  members: [ObjectId] (ref: User)
  pendingInvites: [{
    userId: ObjectId,
    invitedAt: Date,
    invitedBy: ObjectId
  }]
  isPublic: Boolean
  createdAt: Date
  updatedAt: Date
}
```

### Restrictions:
- Only verified **Partners** can create teams
- Each partner can only own **one team**
- Team owners cannot remove themselves (must delete team or transfer ownership)
- Team names must be unique and URL-safe
- Team names cannot be changed after creation (only display name can be edited)

### Additional Features:
- **Admin Panel**: Added "Clear All Stream Keys" and "Regenerate All Stream Keys" buttons
  - Located in Admin panel under "Stream Keys Management"
  - Affects all streamers globally
  - Requires confirmation before executing

## Deploy Instructions

1. **Push to Render** (already done)
2. **Wait 5-10 minutes** for Render to deploy both services:
   - Backend (`aura-streaming`)
   - Frontend (`aura-streaming-1`)
3. **Test the feature**:
   - Make yourself a partner (Admin panel → Toggle Partner status)
   - Go to Settings → Team tab
   - Create a test team
   - Invite another user
   - That user checks Settings → Notifications
   - Accept/decline the invitation

## Status: ✅ COMPLETE

All team features are now fully functional and deployed!

