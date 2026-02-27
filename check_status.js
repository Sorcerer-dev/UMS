const db = require('./src/config/db');

async function checkStatus() {
    try {
        const users = await db('users').select('id', 'email', 'status', 'tag');
        console.log(users.slice(0, 10)); // Print first 10
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkStatus();
