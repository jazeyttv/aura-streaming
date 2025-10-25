// EMERGENCY IP UNBAN SCRIPT FOR JAZEY
// Run this to remove your IP ban

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './server/config.env' });

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aura';

async function unbanJazey() {
  try {
    console.log('🚨 EMERGENCY UNBAN SCRIPT');
    console.log('========================');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Import User model
    const User = require('./server/models/User');

    // Find Jazey
    const jazey = await User.findOne({ username: 'Jazey' });
    
    if (!jazey) {
      console.log('❌ Jazey account not found!');
      process.exit(1);
    }

    console.log(`\n📋 Current Jazey Status:`);
    console.log(`   Username: ${jazey.username}`);
    console.log(`   IP Banned: ${jazey.isIpBanned ? '🚫 YES' : '✅ NO'}`);
    console.log(`   Current IP: ${jazey.ipAddress || 'Unknown'}`);
    console.log(`   Last IP: ${jazey.lastIpAddress || 'Unknown'}`);

    // Remove IP ban
    jazey.isIpBanned = false;
    await jazey.save();

    console.log(`\n✅ IP BAN REMOVED!`);
    console.log(`   Jazey can now access the site again!`);
    console.log(`\n⚠️  IMPORTANT: Restart your server to clear the in-memory ban list!`);
    console.log(`   Run: npm run dev (in server directory)`);
    
    mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

unbanJazey();

