const Importer = require('mysql-import');
const importer = new Importer({
    host: '103.162.17.179',
    port: 3306,
    user: 'mariadb',
    password: 'HPPyFgptEapoVDGZydBn3tB0AljV6LeM5E9cNHUXtQpbrYKtAMSTZo9FmC2pjfW4',
    database: 'default'
});

importer.onProgress(progress => {
    var percent = Math.floor(progress.bytes_processed / progress.total_bytes * 100);
    console.log(`Progress: ${percent}%`);
});

importer.import('C:/Users/hendr/OneDrive/Documents/Antigravity/Warehouse/wakhyu.hadi_warehouse.sql')
    .then(() => {
        const conn = importer.GetConnection();
        conn.end();
        console.log('Database Import Complete!');
    })
    .catch(err => {
        console.error('Database Import Failed:', err);
    });
