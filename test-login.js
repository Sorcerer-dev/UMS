require('dotenv').config();
const db = require('./src/config/db');
const authService = require('./src/modules/auth/auth.service');

async function testLogin() {
    try {
        const users = await db('users').select('id', 'email', 'password_hash').limit(3);
        console.log('Users in DB:', users.map(u => ({ id: u.id, email: u.email })));

        if (users.length > 0) {
            console.log('Testing login for:', users[0].email);
            const user = await db('users').where({ email: users[0].email }).first();
            console.log('Found user details:', user);

            // Testing the login manually
            // We don't have their plaintext password, so we can't test authService.login directly
            // unless we know a default password or if there's an error just retrieving the user
        } else {
            console.log('No users found in database!');
        }
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await db.destroy();
    }
}

testLogin();
