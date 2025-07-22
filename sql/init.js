const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const dbPath = path.join(__dirname, '../db/ecommerce.db');
const db = new sqlite3.Database(dbPath);

function createTableAndInsert(csvPath, tableName, columns, types) {
  return new Promise((resolve) => {
    db.run(`DROP TABLE IF EXISTS ${tableName}`);
    db.run(
      `CREATE TABLE ${tableName} (${columns.map((col, i) => `"${col}" ${types[i]}`).join(', ')})`,
      () => {
        const stmt = db.prepare(
          `INSERT INTO ${tableName} (${columns.map(col => `"${col}"`).join(',')}) VALUES (${columns.map(() => '?').join(',')})`
        );
        fs.createReadStream(csvPath)
          .pipe(csv())
          .on('data', (row) => {
            const values = columns.map((col) => row[col] || null);
            stmt.run(values);
          })
          .on('end', () => {
            stmt.finalize();
            resolve();
          });
      }
    );
  });
}

async function loadData() {
  await createTableAndInsert(
    path.join(__dirname, '../eligibility.csv'),
    'eligibility',
    ['eligibility_datetime_utc', 'item_id', 'eligibility', 'message'],
    ['TEXT', 'TEXT', 'TEXT', 'TEXT']
  );

  await createTableAndInsert(
    path.join(__dirname, '../ad_sales.csv'),
    'ad_sales',
    ['date', 'item_id', 'ad_sales', 'impressions', 'ad_spend', 'clicks', 'units_sold'],
    ['TEXT', 'TEXT', 'REAL', 'INTEGER', 'REAL', 'INTEGER', 'INTEGER']
  );

  await createTableAndInsert(
    path.join(__dirname, '../total_sales.csv'),
    'total_sales',
    ['date', 'item_id', 'total_sales', 'total_units_ordered'],
    ['TEXT', 'TEXT', 'REAL', 'INTEGER']
  );

  console.log('✅ All tables created and data inserted successfully.');
  db.close();
}

loadData();
