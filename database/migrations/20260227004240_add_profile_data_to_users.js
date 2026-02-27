exports.up = async function (knex) {
    await knex.schema.alterTable('users', (table) => {
        table.jsonb('profile_data').defaultTo('{}');
    });
};

exports.down = async function (knex) {
    await knex.schema.alterTable('users', (table) => {
        table.dropColumn('profile_data');
    });
};
