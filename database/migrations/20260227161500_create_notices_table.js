exports.up = function (knex) {
    return knex.schema.createTable('notices', function (table) {
        table.uuid('id').primary().defaultTo(knex.fn.uuid());
        table.string('title').notNullable();
        table.text('content').notNullable();
        table.uuid('author_id').references('id').inTable('users').onDelete('CASCADE');
        table.uuid('department_id').references('id').inTable('departments').onDelete('CASCADE').nullable();
        table.jsonb('visibility').defaultTo('[]');
        table.timestamps(true, true);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('notices');
};
