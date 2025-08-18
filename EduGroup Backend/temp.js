const bcrypt = require('bcrypt');

const plainPassword = 'test1234';
const hash = bcrypt.hashSync(plainPassword, 10);

console.log('Hashed password for', plainPassword, 'is:\n', hash);
