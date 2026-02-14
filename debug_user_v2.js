
const { MongoClient } = require('mongodb');

async function main() {
    const uri = process.env.MONGODB_URI || "mongodb+srv://hi:hi@cluster0.p4s5u.mongodb.net/test?retryWrites=true&w=majority";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('test'); // Default DB

        console.log("--- ALL USERS ---");
        const users = await db.collection('users').find({}).toArray();
        users.forEach(u => console.log(`ID: ${u._id}, Name: ${u.name}, Email: ${u.email}`));

        console.log("\n--- RECENT LEAVE REQUESTS ---");
        const requests = await db.collection('leaverequests').find({}).sort({ createdAt: -1 }).limit(5).toArray();
        requests.forEach(r => console.log(`Req: ${r._id}, UserRef: ${r.user}, Status: ${r.status}`));

    } finally {
        await client.close();
    }
}
main();
