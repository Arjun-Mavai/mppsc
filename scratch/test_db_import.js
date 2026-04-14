
console.log('Starting import test...');
try {
    const { createClient } = require('@libsql/client');
    console.log('Import successful!');
    const client = createClient({ url: 'file:test.db' });
    console.log('Client created!');
} catch (e) {
    console.error('Import failed!', e);
}
