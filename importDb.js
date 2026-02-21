const fs = require('fs');
const mysql = require('mysql2/promise');

async function importDb() {
  console.log('Connecting to remote database default...');
  try {
    const conn = await mysql.createConnection({
      host: '103.162.17.179',
      port: 3306,
      user: 'mariadb',
      password: 'HPPyFgptEapoVDGZydBn3tB0AljV6LeM5E9cNHUXtQpbrYKtAMSTZo9FmC2pjfW4',
      database: 'default',
      multipleStatements: true,
      connectTimeout: 20000
    });
    console.log('Connected directly to the database!');

    console.log('Reading SQL file...');
    const sql = fs.readFileSync('C:/Users/hendr/OneDrive/Documents/Antigravity/Warehouse/wakhyu.hadi_warehouse.sql', 'utf8');

    console.log('File read successfully. Executing SQL (This will take a few minutes for 187MB)...');

    await conn.query(sql);
    console.log('Database import completed successfully!');
    await conn.end();
  } catch (err) {
    console.error('Error during import:', err.message);
  }
}

importDb();
