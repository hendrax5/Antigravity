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
        const tables = [
            'm_gudang_barang', 'm_gudang_kategori', 'm_gudang_cabang', 'm_gudang_area',
            't_gudang_barang_masuk', 't_gudang_barang_keluar', 't_gudang_request',
            't_gudang_request_detail', 't_gudang_po', 't_gudang_po_barang',
            't_gudang_serial_number', 't_gudang_rusak', 'user'
        ];
        for (const t of tables) {
            try {
                const [[row]] = await conn.query(`SHOW CREATE TABLE ${t}`);
                console.log(`\n--- ${t} ---`);
                console.log(row['Create Table']);
            } catch (e) { console.log(`Table ${t} not found or error.`); }
        }
        await conn.end();
    } catch (err) {
        console.error('Error:', err.message);
    }
}
test();
