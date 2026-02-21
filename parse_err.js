const fs = require('fs');
const content = fs.readFileSync('error_log.txt', 'utf16le');
const errParts = content.split('--- PRISMA ERROR DUMP ---');
if (errParts.length > 1) {
    console.log(errParts[1].substring(0, 1000));
} else {
    console.log(content.substring(Math.max(0, content.length - 1500)));
}
