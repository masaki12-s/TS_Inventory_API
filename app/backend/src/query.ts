import mysql from 'mysql';

// テーブル

function addTestData(conn: mysql.Connection) {
    conn.query('INSERT INTO stock (name, amount, sales) VALUES ("apple", 10, 100);');
    conn.query('INSERT INTO stock (name, amount, sales) VALUES ("banana", 20, 200);');
    conn.query('INSERT INTO stock (name, amount, sales) VALUES ("orange", 1, 0);');
}

export { addTestData };