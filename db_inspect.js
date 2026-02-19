const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://bandelaajaykumar360_db_user:BDyEhHlC2i2D9shc@cluster0.oi2cvq9.mongodb.net/hrms?appName=Cluster0";

async function main() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('hrms');

        console.log("--- COLLECTIONS ---");
        const collections = await db.listCollections().toArray();
        console.log(collections.map(c => c.name));

        console.log("\n--- USERS COLLECTION ---");
        const users = await db.collection('User').find({}).toArray();
        if (users.length === 0) {
            console.log("No documents in 'User' collection. Trying 'users'...");
            const usersAlt = await db.collection('users').find({}).toArray();
            usersAlt.forEach(u => console.log(`- ${u.email || u.emailAddress} (ID: ${u._id})`));
        } else {
            users.forEach(u => console.log(`- ${u.email} (ID: ${u._id})`));
        }

        console.log("\n--- EMPLOYEES COLLECTION ---");
        const employees = await db.collection('Employee').find({}).toArray();
        if (employees.length === 0) {
            console.log("No documents in 'Employee' collection. Trying 'employees'...");
            const employeesAlt = await db.collection('employees').find({}).toArray();
            employeesAlt.forEach(e => console.log(`- ${e.email} (ID: ${e._id}, Name: ${e.firstName} ${e.lastName})`));
        } else {
            employees.forEach(e => console.log(`- ${e.email} (ID: ${e._id}, Name: ${e.firstName} ${e.lastName})`));
        }

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}
main();
