const mysql = require('mysql2/promise');
async function run() {
    const conn = await mysql.createConnection({
        host: '103.162.17.179', port: 3306, user: 'mariadb',
        password: 'HPPyFgptEapoVDGZydBn3tB0AljV6LeM5E9cNHUXtQpbrYKtAMSTZo9FmC2pjfW4', database: 'default'
    });
    for (let table of ['m_gudang_kategori', 'm_gudang_cabang', 'm_gudang_area', 'user']) {
        const [rows] = await conn.query(`DESCRIBE ${table}`);
        console.log(`\n--- ${table} ---`);
        rows.forEach(r => console.log(r.Field));
    }
    await conn.end();
}
run();
