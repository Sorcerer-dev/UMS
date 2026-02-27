exports.up = async function (knex) {
    await knex.schema.alterTable('users', (table) => {
        table.string('status').defaultTo('Active').notNullable();
    });
};

exports.down = async function (knex) {
    await knex.schema.alterTable('users', (table) => {
        table.dropColumn('status');
    });
};
