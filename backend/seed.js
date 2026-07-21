const { Client } = require('pg');
const { faker } = require('@faker-js/faker');
require('dotenv').config();

// Connect using your existing database credentials
const client = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432
});

async function seedDatabase() {
  try {
    await client.connect();
    console.log('✅ Connected to AWS RDS PostgreSQL');

    // Create a new table specifically for our migration test
    await client.query(`
      CREATE TABLE IF NOT EXISTS enterprise_customers (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        email VARCHAR(255),
        account_balance DECIMAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Created enterprise_customers table');

    console.log('⏳ Generating 10,000 records... this might take a minute...');
    
    // Insert 10,000 fake users
    for (let i = 0; i < 10000; i++) {
      const firstName = faker.person.firstName().replace(/'/g, "''");
      const lastName = faker.person.lastName().replace(/'/g, "''");
      const email = faker.internet.email({ firstName, lastName });
      const balance = faker.finance.amount();

      await client.query(`
        INSERT INTO enterprise_customers (first_name, last_name, email, account_balance)
        VALUES ('${firstName}', '${lastName}', '${email}', ${balance})
      `);

      if (i % 1000 === 0 && i > 0) {
        console.log(`... Inserted ${i} records`);
      }
    }

    console.log('🎉 Successfully seeded 10,000 records into RDS!');
  } catch (err) {
    console.error('❌ Error seeding database:', err);
  } finally {
    await client.end();
  }
}

seedDatabase();