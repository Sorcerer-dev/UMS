exports.up = async function (knex) {
  // Enable RLS on users table
  await knex.raw(`ALTER TABLE users ENABLE ROW LEVEL SECURITY;`);

  // Create RLS Policy for users:
  // Root Admin, Managing Director, and Admin can see all users.
  // Others can only see users in their own department.
  await knex.raw(`
    CREATE POLICY "Department Silo Access" ON users
    FOR SELECT
    USING (
      (current_setting('request.jwt.claim.tag', true) IN ('Root Admin', 'Managing Director', 'Admin'))
      OR
      (department_id = NULLIF(current_setting('request.jwt.claim.department_id', true), '')::uuid)
    );
  `);

  // Enable RLS for other actions (Insert, Update, Delete)
  // For simplicity, we enforce access through the API layer middleware (add-down rule),
  // but we can add an RLS policy for safety: owners can update their own non-tag data.
  await knex.raw(`
    CREATE POLICY "Users Update Own Record" ON users
    FOR UPDATE
    USING (
      id = NULLIF(current_setting('request.jwt.claim.user_id', true), '')::uuid
      OR
      (current_setting('request.jwt.claim.tag', true) IN ('Root Admin', 'Managing Director', 'Admin'))
      OR
      (department_id = NULLIF(current_setting('request.jwt.claim.department_id', true), '')::uuid)
    );
  `);
};

exports.down = async function (knex) {
  await knex.raw(`DROP POLICY IF EXISTS "Users Update Own Record" ON users;`);
  await knex.raw(`DROP POLICY IF EXISTS "Department Silo Access" ON users;`);
  await knex.raw(`ALTER TABLE users DISABLE ROW LEVEL SECURITY;`);
};
