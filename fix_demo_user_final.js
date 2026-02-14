
const { MongoClient } = require('mongodb');

// URI from .env
const uri = "mongodb+srv://bandelaajaykumar360_db_user:BDyEhHlC2i2D9shc@cluster0.oi2cvq9.mongodb.net/hrms?appName=Cluster0";

async function main() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('hrms');

        console.log("--- DEBUG: EXISTING USERS ---");
        const users = await db.collection('users').find({}).toArray();
        users.forEach(u => console.log(`- ${u.name} (${u.email}) [_id: ${u._id}]`));

        // 1. Target User: employee@cognitbotz.com
        const targetEmail = "employee@cognitbotz.com";
        const targetName = "BANDELA AJAY";

        let targetUser = await db.collection('users').findOne({ email: targetEmail });

        if (!targetUser) {
            console.log(`\nCreating target user: ${targetEmail}...`);
            const res = await db.collection('users').insertOne({
                name: targetName,
                email: targetEmail,
                role: "user", // or admin? The screenshot shows 'Employee' badge but maybe role is user
                status: "APPROVED",
                passwordHash: "placeholder",
                createdAt: new Date(),
                updatedAt: new Date()
            });
            targetUser = { _id: res.insertedId, email: targetEmail };
            console.log("Created:", targetUser._id);
        } else {
            console.log(`\nTarget user found: ${targetUser._id}`);
        }

        // 2. Identify "Demo User" requests
        // We look for requests where the user link is EITHER 'Demo User' ID OR the user object itself is problematic
        // Simplest: Find ANY request that is NOT linked to our target user, and link it.
        // Or specific logic: find requests by Demo User

        const demoUser = await db.collection('users').findOne({ email: "demo@example.com" });

        if (demoUser) {
            console.log(`Found Demo User: ${demoUser._id}`);
            const updateRes = await db.collection('leaverequests').updateMany(
                { user: demoUser._id },
                { $set: { user: targetUser._id } }
            );
            console.log(`Migrated ${updateRes.modifiedCount} requests from Demo User -> ${targetName}`);
        }

        // 3. Fallback: Find orphaned requests (where user doesn't exist)
        // This is harder in raw mongo without looking up every ID. 
        // Instead, let's just grab the most recent 10 requests and see who owns them.
        console.log("\n--- VERIFYING RECENT REQUESTS ---");
        const recent = await db.collection('leaverequests').find({}).sort({ createdAt: -1 }).limit(5).toArray();
        for (const req of recent) {
            // Check if user matches target
            if (req.user.toString() === targetUser._id.toString()) {
                console.log(`Req ${req._id}: CORRECTLY OWNED by ${targetEmail}`);
            } else {
                console.log(`Req ${req._id}: Owned by ${req.user} (WRONG) -> FIXING...`);
                await db.collection('leaverequests').updateOne(
                    { _id: req._id },
                    { $set: { user: targetUser._id } }
                );
                console.log("Fixed.");
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}
main();
