require('dotenv').config();
const knex = require('knex');
const bcrypt = require('bcrypt');
const knexfile = require('../../knexfile');

const environment = process.env.NODE_ENV || 'development';
const db = knex(knexfile[environment]);

async function seedRootAdmin() {
    try {
        const existingRoot = await db('users').where({ tag: 'Root Admin' }).first();
        if (existingRoot) {
            console.log('Root Admin already exists. Initializing skipped.');
            process.exit(0);
        }

        const saltRounds = 12; // Minimum 12 rounds as per requirements
        const passwordHash = await bcrypt.hash(process.env.ROOT_PASSWORD || 'Rootadmin@123', saltRounds);

        const [rootUser] = await db('users').insert({
            email: process.env.ROOT_EMAIL || 'root@ums.edu',
            password_hash: passwordHash,
            tag: 'Root Admin'
            // department_id is null for root admin
        }).returning(['id', 'email', 'tag']);

        console.log('Successfully created Root Admin:', rootUser);
    } catch (error) {
        console.error('Error seeding Root Admin:', error);
    } finally {
        db.destroy();
    }
}

seedRootAdmin();
