exports.up = async function (knex) {
    // Create Tag Enum
    await knex.raw(`
    CREATE TYPE user_tag AS ENUM (
      'Root Admin',
      'Managing Director',
      'Admin',
      'Dean',
      'HOD',
      'Staff',
      'Student'
    );
  `);

    // Create Departments Table
    await knex.schema.createTable('departments', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.string('name').notNullable().unique();
        table.timestamps(true, true);
    });

    // Create Users Table
    await knex.schema.createTable('users', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.string('email').notNullable().unique();
        table.string('password_hash').notNullable();
        table.specificType('tag', 'user_tag').notNullable();
        table.uuid('department_id').references('id').inTable('departments').onDelete('SET NULL');
        table.uuid('created_by').references('id').inTable('users').onDelete('SET NULL');
        table.timestamps(true, true);
    });

    // Create Channels Table
    await knex.schema.createTable('channels', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.string('name').notNullable();
        table.specificType('minimum_tag_required', 'user_tag').notNullable();
        table.timestamps(true, true);
    });

    // Create Messages Table
    await knex.schema.createTable('messages', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('channel_id').notNullable().references('id').inTable('channels').onDelete('CASCADE');
        table.uuid('sender_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.specificType('sender_tag', 'user_tag').notNullable();
        table.text('content').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });

    // Create Temporary Permissions Table
    await knex.schema.createTable('temporary_permissions', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('grantor_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.uuid('recipient_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.string('action').notNullable(); // e.g., 'mark_attendance'
        table.boolean('is_active').defaultTo(true);
        table.timestamp('expires_at').notNullable();
        table.timestamps(true, true);
    });

    // Create Audit Logs Table
    await knex.schema.createTable('audit_logs', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
        table.string('action').notNullable();
        table.string('resource').notNullable();
        table.uuid('resource_id');
        table.jsonb('details');
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = async function (knex) {
    await knex.schema.dropTableIfExists('audit_logs');
    await knex.schema.dropTableIfExists('temporary_permissions');
    await knex.schema.dropTableIfExists('messages');
    await knex.schema.dropTableIfExists('channels');
    await knex.schema.dropTableIfExists('users');
    await knex.schema.dropTableIfExists('departments');
    await knex.raw('DROP TYPE IF EXISTS user_tag;');
};
