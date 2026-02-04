const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGODB_URI = 'mongodb+srv://extrahand614_db_user:aEgPtYiKNpHuSjDU@cluster0.wjubwjn.mongodb.net/?appName=Cluster0';

// User Schema (matching the model)
const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    passwordHash: String,
    role: {
        type: String,
        enum: ['user', 'admin', 'supervisor'],
        default: 'user'
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'],
        default: 'PENDING'
    },
    emailVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    lastLoginAt: Date
});

const User = mongoose.model('User', UserSchema);

async function setupTestUsers() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Check existing users
        console.log('📋 Checking existing users in database...\n');
        const existingUsers = await User.find({}).select('name email role status');

        if (existingUsers.length > 0) {
            console.log(`Found ${existingUsers.length} existing users:\n`);
            existingUsers.forEach((user, index) => {
                console.log(`${index + 1}. ${user.name}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Role: ${user.role}`);
                console.log(`   Status: ${user.status}\n`);
            });
        } else {
            console.log('No users found in database.\n');
        }

        // Test users to create/update
        const testUsers = [
            {
                name: 'Admin User',
                email: 'admin@extrahand.com',
                password: 'admin123',
                role: 'admin',
                status: 'APPROVED'
            },
            {
                name: 'Supervisor User',
                email: 'supervisor@extrahand.com',
                password: 'supervisor123',
                role: 'supervisor',
                status: 'APPROVED'
            },
            {
                name: 'Agent User',
                email: 'agent@extrahand.com',
                password: 'agent123',
                role: 'user',
                status: 'APPROVED'
            }
        ];

        console.log('🔧 Creating/Updating test users...\n');

        for (const userData of testUsers) {
            const existingUser = await User.findOne({ email: userData.email });

            if (existingUser) {
                // Update existing user
                const passwordHash = await bcrypt.hash(userData.password, 10);
                await User.findByIdAndUpdate(existingUser._id, {
                    name: userData.name,
                    passwordHash,
                    role: userData.role,
                    status: userData.status,
                    emailVerified: true
                });
                console.log(`✅ Updated: ${userData.email} (${userData.role})`);
            } else {
                // Create new user
                const passwordHash = await bcrypt.hash(userData.password, 10);
                await User.create({
                    name: userData.name,
                    email: userData.email,
                    passwordHash,
                    role: userData.role,
                    status: userData.status,
                    emailVerified: true
                });
                console.log(`✅ Created: ${userData.email} (${userData.role})`);
            }
        }

        console.log('\n✨ Test users setup complete!\n');
        console.log('═══════════════════════════════════════════════════════');
        console.log('📝 TEST CREDENTIALS FOR ALL ROLES:');
        console.log('═══════════════════════════════════════════════════════\n');

        console.log('🔴 ADMIN ROLE:');
        console.log('   Email: admin@extrahand.com');
        console.log('   Password: admin123');
        console.log('   Access: Full system control, user management, settings\n');

        console.log('🟣 SUPERVISOR ROLE:');
        console.log('   Email: supervisor@extrahand.com');
        console.log('   Password: supervisor123');
        console.log('   Access: Team oversight, all tickets, reports, assign tickets\n');

        console.log('🔵 AGENT ROLE:');
        console.log('   Email: agent@extrahand.com');
        console.log('   Password: agent123');
        console.log('   Access: Handle tickets, chat with customers, view history\n');

        console.log('═══════════════════════════════════════════════════════\n');

        // Show all users after setup
        console.log('📊 ALL USERS IN DATABASE:\n');
        const allUsers = await User.find({}).select('name email role status createdAt');
        allUsers.forEach((user, index) => {
            const roleEmoji = user.role === 'admin' ? '🔴' : user.role === 'supervisor' ? '🟣' : '🔵';
            const statusEmoji = user.status === 'APPROVED' ? '✅' : user.status === 'SUSPENDED' ? '🚫' : '⏳';
            console.log(`${index + 1}. ${roleEmoji} ${user.name}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Role: ${user.role.toUpperCase()}`);
            console.log(`   Status: ${statusEmoji} ${user.status}`);
            console.log(`   Created: ${user.createdAt.toLocaleDateString()}\n`);
        });

        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

setupTestUsers();
