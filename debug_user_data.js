
const { MongoClient } = require('mongodb');

async function main() {
    const uri = process.env.MONGODB_URI || "mongodb+srv://hi:hi@cluster0.p4s5u.mongodb.net/test?retryWrites=true&w=majority";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('test');

        console.log("--- USERS ---");
        const users = await db.collection('users').find({}).toArray();
        users.forEach(u => console.log(`${u._id}: ${u.name} (${u.email})`));

        console.log("\n--- LEAVE REQUESTS ---");
        const requests = await db.collection('leaverequests').find({}).toArray();
        requests.forEach(r => console.log(`${r._id}: UserID=${r.user}, Status=${r.status}`));

    } finally {
        await client.close();
    }
}
main();
