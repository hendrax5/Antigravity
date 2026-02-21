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
        console.log('Connected!');

        console.log('Fetching users...');
        const [rows] = await conn.query('SELECT username, id_user FROM user LIMIT 2');
        console.log('Users:', rows);

        console.log('Fetching items count...');
        const [items] = await conn.query('SELECT COUNT(*) as total FROM m_gudang_barang');
        console.log('Total items:', items[0].total);

        await conn.end();
    } catch (err) {
        console.error('Error:', err.message);
    }
}
test();
