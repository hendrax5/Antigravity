const mysql = require('mysql2/promise');
const fs = require('fs');
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
        let dump = '';
        for (const t of tables) {
            try {
                const [[row]] = await conn.query(`SHOW CREATE TABLE ${t}`);
                dump += `\n--- ${t} ---\n`;
                dump += row['Create Table'];
                dump += '\n';
            } catch (e) { dump += `Table ${t} error: ${e}\n`; }
        }
        fs.writeFileSync('schema_utf8.txt', dump);
        await conn.end();
        console.log('done');
    } catch (err) {
        console.error('Error:', err.message);
    }
}
test();
