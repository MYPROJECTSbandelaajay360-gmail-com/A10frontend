/**
 * Script to create/approve an agent account for the Agent Portal
 * Run with: node setup-agent.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB Atlas connection string
const MONGODB_URI = 'mongodb+srv://projectstrizen_db_user:trizen123@cluster0.fg1vhqz.mongodb.net/extrahand-support';

// Define User Schema (same as in the app)
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  passwordHash: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'], default: 'PENDING' },
  emailVerified: Boolean,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  approvedAt: Date,
  lastLoginAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

async function setupAgent() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Agent credentials
    const agentEmail = 'agent@gmail.com';
    const agentPassword = 'Agent123!';
    const agentName = 'Support Agent';

    // Check if agent already exists
    let agent = await User.findOne({ email: agentEmail });

    if (agent) {
      console.log(`📝 Agent account found: ${agentEmail}`);
      
      // Update to APPROVED status
      agent.status = 'APPROVED';
      agent.role = 'admin';
      agent.emailVerified = true;
      agent.approvedAt = new Date();
      agent.loginAttempts = 0;
      agent.lockUntil = undefined;
      await agent.save();
      
      console.log('✅ Agent account APPROVED and updated\n');
    } else {
      // Create new agent
      console.log(`Creating new agent account: ${agentEmail}`);
      
      const passwordHash = await bcrypt.hash(agentPassword, 10);
      
      agent = new User({
        name: agentName,
        email: agentEmail,
        passwordHash: passwordHash,
        role: 'admin',
        status: 'APPROVED',
        emailVerified: true,
        approvedAt: new Date(),
        loginAttempts: 0
      });
      
      await agent.save();
      console.log('✅ New agent account created and APPROVED\n');
    }

    // Also approve the test user if exists
    const testUser = await User.findOne({ email: 'testuser@gmail.com' });
    if (testUser) {
      console.log('📝 Found testuser@gmail.com');
      testUser.status = 'APPROVED';
      testUser.emailVerified = true;
      testUser.approvedAt = new Date();
      testUser.loginAttempts = 0;
      testUser.lockUntil = undefined;
      await testUser.save();
      console.log('✅ testuser@gmail.com APPROVED\n');
    }

    // Display credentials
    console.log('═══════════════════════════════════════════');
    console.log('🎉 AGENT PORTAL LOGIN CREDENTIALS');
    console.log('═══════════════════════════════════════════');
    console.log('URL: http://localhost:3005');
    console.log('');
    console.log('Primary Agent Account:');
    console.log(`  Email:    ${agentEmail}`);
    console.log(`  Password: ${agentPassword}`);
    console.log(`  Role:     admin`);
    console.log(`  Status:   APPROVED ✅`);
    
    if (testUser) {
      console.log('');
      console.log('Alternative Account (testuser):');
      console.log('  Email:    testuser@gmail.com');
      console.log('  Password: TestPass123!');
      console.log('  Role:     user');
      console.log('  Status:   APPROVED ✅');
    }
    
    console.log('═══════════════════════════════════════════\n');

    await mongoose.connection.close();
    console.log('✅ Done!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupAgent();
