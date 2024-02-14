var mysql = require('mysql2');

var con = mysql.createConnection({
  host: "mysql-db",
  user: "root",
  password: "root"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  con.query("CREATE DATABASE dbYelpCamp", function (err, result) {
    if (err) throw err;
    console.log("Database created");
  });
});