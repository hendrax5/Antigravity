const fs = require('fs');
const mysql = require('mysql2/promise');

const env = fs.readFileSync('.env', 'utf8');
const dbUrlMatch = env.match(/DATABASE_URL="([^"]+)"/);
if (!dbUrlMatch) { console.error('No DB URL found in .env'); process.exit(1); }

async function main() {
    try {
        const pool = mysql.createPool(dbUrlMatch[1]);
        console.log('Connected to DB');
        await pool.execute('ALTER TABLE t_gudang_serial_number ADD COLUMN lokasi_pop VARCHAR(255) NULL;');
        console.log('✅ Column lokasi_pop added to t_gudang_serial_number.');
        await pool.end();
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log('✅ Column lokasi_pop already exists.');
        } else {
            console.error('SQL Error:', e);
        }
    }
}
main();
