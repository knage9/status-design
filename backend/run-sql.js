const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect().then(async () => {
    try {
        const sql = fs.readFileSync('update-enum.sql', 'utf8');
        await client.query(sql);
        console.log('SQL successful!');
    } catch(e) {
        console.error('SQL Error:', e);
    } finally {
        await client.end();
    }
}).catch(console.error);
