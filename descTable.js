const mysql = require('mysql2/promise');
async function test() {
    try {
        const conn = await mysql.createConnection({
            host: '103.162.17.179',
            port: 3306,
            user: 'mariadb',
            password: 'HPPyFgptEapoVDGZydBn3tB0AljV6LeM5E9cNHUXtQpbrYKtAMSTZo9FmC2pjfW4',
            database: 'default'
        });
        const [rows] = await conn.query('DESCRIBE t_gudang_barang_masuk');
        console.log('Columns:');
        rows.forEach(r => console.log(`- ${r.Field} (${r.Type})`));
        await conn.end();
    } catch (err) {
        console.error('Error:', err.message);
    }
}
test();
