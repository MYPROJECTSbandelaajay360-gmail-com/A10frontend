
const { MongoClient } = require('mongodb');

// Use the exact URI from .env
const uri = "mongodb+srv://bandelaajaykumar360_db_user:BDyEhHlC2i2D9shc@cluster0.oi2cvq9.mongodb.net/hrms?appName=Cluster0";

async function main() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('hrms'); // Use 'hrms' db as per connection string

        console.log("--- USERS ---");
        const users = await db.collection('users').find({}).toArray();
        if (users.length === 0) console.log("No users found.");
        users.forEach(u => console.log(`ID: ${u._id}, Name: ${u.name}, Email: ${u.email}`));

        console.log("\n--- LEAVE REQUESTS ---");
        const requests = await db.collection('leaverequests').find({}).toArray();
        if (requests.length === 0) console.log("No leave requests found.");
        requests.forEach(r => console.log(`Req: ${r._id}, UserRef: ${r.user}, Status: ${r.status}`));

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await client.close();
    }
}
main();
