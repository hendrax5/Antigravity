const fs = require('fs');
const readline = require('readline');
const mysql = require('mysql2/promise');

async function run() {
    const filePath = 'C:/Users/hendr/OneDrive/Documents/Antigravity/Warehouse/wakhyu.hadi_warehouse.sql';
    console.log('Connecting...');
    const conn = await mysql.createConnection({
        host: '103.162.17.179',
        port: 3306,
        user: 'mariadb',
        password: 'HPPyFgptEapoVDGZydBn3tB0AljV6LeM5E9cNHUXtQpbrYKtAMSTZo9FmC2pjfW4',
        database: 'default',
        multipleStatements: true
    });
    console.log('Connected.');

    console.log('Starting stream...');
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let buffer = '';
    let count = 0;

    for await (const line of rl) {
        if (line.trim().startsWith('--') || line.trim() === '') continue;
        buffer += line + '\n';

        if (buffer.trim().endsWith(';')) {
            try {
                await conn.query(buffer);
                count++;
                if (count % 100 === 0) console.log(`Executed ${count} statements...`);
            } catch (err) {
                console.error(`Error on statement ${count}:\n`, err.message);
            }
            buffer = '';
        }
    }

    console.log(`Done! Executed ${count} statements total.`);
    await conn.end();
}

run().catch(console.error);
