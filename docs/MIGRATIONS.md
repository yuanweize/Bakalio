# Migration policy

Use versioned Prisma migrations generated through Wasp. For deployment, apply `prisma migrate deploy` against the generated schema/migration location. Do not use reset or db push as startup steps.

The initial migration creates the Research Studio entities and Wasp auth entities on a dedicated empty database. It does not read or modify another application's schema. PgBoss initializes its own queue schema on API startup.

Back up database and private attachments together while writes are stopped. Preserve matching application commit and lockfile with a backup. Schema changes must remain compatible with the previous version during rolling deployment; destructive changes require a separate planned migration.
