const mysql = require('mysql2');

const con = mysql.createConnection({
  host: 'mysql-db',
  user: 'root',
  password: 'root',
  database: 'products'
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });

module.exports = con;