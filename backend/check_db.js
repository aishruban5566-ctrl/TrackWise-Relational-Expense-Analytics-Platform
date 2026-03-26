const db = require('./config/db');
(async () => {
  try {
    console.log('SHOW TABLES:');
    let [tables] = await db.query('SHOW TABLES');
    console.log(tables);

    console.log('\nDESCRIBE expense_groups:');
    let [desc] = await db.query('DESCRIBE `expense_groups`');
    console.log(desc);
  } catch (err) {
    console.error('ERROR', err);
  } finally {
    process.exit();
  }
})();