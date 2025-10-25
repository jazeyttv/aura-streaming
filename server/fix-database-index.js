// Fix MongoDB duplicate streamKey index issue
const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

async function fixDatabase() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kicky');
    console.log('✅ Connected!');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    console.log('🔧 Dropping old streamKey index...');
    try {
      await usersCollection.dropIndex('streamKey_1');
      console.log('✅ Old index dropped!');
    } catch (err) {
      console.log('ℹ️  Index might not exist, continuing...');
    }

    console.log('🔧 Creating new partial index for streamKey...');
    await usersCollection.createIndex(
      { streamKey: 1 },
      { 
        unique: true, 
        partialFilterExpression: { streamKey: { $type: 'string' } }
      }
    );
    console.log('✅ New index created! (Only applies to non-null streamKeys)');

    console.log('🔧 Updating existing users with empty streamKey...');
    const result = await usersCollection.updateMany(
      { streamKey: '' },
      { $set: { streamKey: null } }
    );
    console.log(`✅ Updated ${result.modifiedCount} users!`);

    console.log('\n✅ Database fixed! Registration should work now.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing database:', error);
    process.exit(1);
  }
}

fixDatabase();

