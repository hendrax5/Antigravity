const fs = require('fs');
const readline = require('readline');
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
        console.log('Connected! Streaming SQL file line by line...');

        // Disable foreign key checks for the import
        await conn.query('SET FOREIGN_KEY_CHECKS = 0;');

        const fileStream = fs.createReadStream('C:/Users/hendr/OneDrive/Documents/Antigravity/Warehouse/wakhyu.hadi_warehouse.sql', 'utf8');
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        let statement = '';
        let count = 0;

        // Process line by line
        for await (const line of rl) {
            if (line.trim().startsWith('--') || line.trim().startsWith('/*') || line.trim().length === 0) {
                continue;
            }

            statement += line + '\n';

            // If the line ends with a semicolon and we aren't in the middle of a string block 
            // (This is a simplified assumption that works for mysqldump inserts formatted with ; at the end of lines)
            if (line.trim().endsWith(';')) {
                try {
                    await conn.query(statement);
                    count++;
                    if (count % 50 === 0) {
                        process.stdout.write(`.`); // progress indicator
                    }
                } catch (e) {
                    console.error(`\nError executing statement: ${e.message.substring(0, 100)}`);
                    // Continue execution despite error (similar to mysql -f)
                }
                statement = ''; // Reset for next statement
            }
        }

        await conn.query('SET FOREIGN_KEY_CHECKS = 1;');
        console.log('\nDatabase import completed smoothly! Executed ' + count + ' statements.');
        await conn.end();
    } catch (err) {
        console.error('Connection error:', err.message);
    }
}

importDb();
