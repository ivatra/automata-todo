import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Client } from 'pg';

config();

const client = new Client({
  connectionString: process.env.DB_URL,
});

async function main() {
  await client.connect();
  const db = drizzle(client);

  console.log('Running migrations...');

  await migrate(db, {
    migrationsFolder: './drizzle',
  });

  console.log('Migrations completed!');

  await client.end();
}

main().catch((err) => {
  console.error('Migration failed!', err);
  process.exit(1);
});