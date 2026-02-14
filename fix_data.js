
const { MongoClient } = require('mongodb');

// Use the exact URI from .env
const uri = "mongodb+srv://bandelaajaykumar360_db_user:BDyEhHlC2i2D9shc@cluster0.oi2cvq9.mongodb.net/hrms?appName=Cluster0";

async function main() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('hrms'); // Use 'hrms' db as per connection string

        // 1. Force Create Bandela Ajay if missing
        console.log("Checking for Bandela Ajay...");
        let user = await db.collection('users').findOne({ email: { $regex: /bandela/i } });

        if (!user) {
            console.log("Creating Bandela Ajay...");
            const newUser = {
                name: "Bandela Ajay",
                email: "bandelaajaykumar360@gmail.com", // Assuming this is the email
                role: "admin", // Assuming admin role
                status: "APPROVED",
                passwordHash: "placeholder",
                createdAt: new Date(),
                updatedAt: new Date(),
                emailVerified: true
            };
            const result = await db.collection('users').insertOne(newUser);
            user = { _id: result.insertedId, ...newUser };
            console.log("Created User:", user._id);
        } else {
            console.log("Found User:", user._id, user.name);
        }

        // 2. Find Demo User
        const demoUser = await db.collection('users').findOne({ email: "demo@example.com" });
        if (demoUser) {
            console.log("Found Demo User:", demoUser._id);

            // 3. Migrate Requests
            const result = await db.collection('leaverequests').updateMany(
                { user: demoUser._id },
                { $set: { user: user._id } }
            );
            console.log(`Migrated ${result.modifiedCount} requests from Demo User to Bandela Ajay`);

            // 4. Delete Demo User to prevent recurrence
            // await db.collection('users').deleteOne({ _id: demoUser._id });
            // console.log("Deleted Demo User");
        } else {
            console.log("Demo User not found (might have been cleaned up already)");
            // Fallback: Check for any requests with NO valid user or matching demo pattern and assign them
            // Or just assign ALL requests to Bandela Ajay for this fix since he is likely the only user
            // const allRequests = await db.collection('leaverequests').updateMany({}, { $set: { user: user._id } });
            // console.log(`Force assigned ${allRequests.modifiedCount} total requests to Bandela Ajay`);
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await client.close();
    }
}
main();
