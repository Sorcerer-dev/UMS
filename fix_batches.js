const db = require('./src/config/db');

async function fixBatches() {
    try {
        console.log('Fixing old student batches...');

        // Update all students who do not have a batch assigned
        const result = await db('users')
            .where({ tag: 'Student' })
            .where(function () {
                this.whereNull('batch').orWhere('batch', '')
            })
            .update({ batch: '2023-2027' });

        console.log(`Updated ${result} students to batch '2023-2027'.`);
        process.exit(0);
    } catch (error) {
        console.error('Error fixing batches:', error);
        process.exit(1);
    }
}

fixBatches();
