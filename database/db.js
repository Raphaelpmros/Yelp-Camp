const mysql = require('mysql2');

const conConfig = {
  host: 'mysql-db',
  user: 'root',
  password: 'root',
  database: 'dbYelpCamp'
};

const con = mysql.createConnection(conConfig);

con.connect((err) => {
  if (err) {
    console.error('Erro ao conectar-se ao banco de dados:', err.stack);
    return;
  }

  console.log('Conectado ao banco de dados.');
});

const createCampgroundTableSQL = `
  CREATE TABLE IF NOT EXISTS campground (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    price INT NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    image LONGTEXT,
    author INT,
    FOREIGN KEY(author) REFERENCES user(id)
  );
`;

con.query(createCampgroundTableSQL, (err, result) => {
  if (err) {
    console.error('Erro ao criar tabela campground:', err);
    return;
  }

  console.log('Tabela campground criada com sucesso.');
});

module.exports = con;