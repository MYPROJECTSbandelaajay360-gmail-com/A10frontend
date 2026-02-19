const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://bandelaajaykumar360_db_user:BDyEhHlC2i2D9shc@cluster0.oi2cvq9.mongodb.net/hrms?appName=Cluster0";

async function main() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('hrms');

        const mappings = [
            { old: 'admin@cognitbotz.com', new: 'admin@gmail.com' },
            { old: 'hr@cognitbotz.com', new: 'hr@gmail.com' },
            { old: 'employee@cognitbotz.com', new: 'employee@gmail.com' },
            { old: 'manager@cognitbotz.com', new: 'manager@gmail.com' },
            { old: 'info@cognitbotz.com', new: 'info@gmail.com' }
        ];

        console.log("--- STARTING FINAL MIGRATION ---");

        for (const m of mappings) {
            // Update User collection
            const uRes = await db.collection('User').updateMany(
                { email: m.old },
                { $set: { email: m.new } }
            );

            // Update Employee collection
            const eRes = await db.collection('Employee').updateMany(
                { email: m.old },
                { $set: { email: m.new } }
            );

            console.log(`- Updated ${m.old} -> ${m.new}`);
            console.log(`  User: ${uRes.modifiedCount}, Employee: ${eRes.modifiedCount}`);
        }

        // Verification
        console.log("\n--- VERIFICATION ---");
        const remainingUsers = await db.collection('User').find({ email: /cognitbotz\.com$/ }).toArray();
        console.log(`Users still with @cognitbotz.com: ${remainingUsers.length}`);
        remainingUsers.forEach(u => console.log(`  - ${u.email}`));

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}
main();
