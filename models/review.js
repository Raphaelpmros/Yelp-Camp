const con = require("../database/db"); 

con.connect(function (err) {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    
    console.log('Conexão bem-sucedida ao banco de dados');

    var createTableQuery = "CREATE TABLE IF NOT EXISTS reviews (id INT PRIMARY KEY AUTO_INCREMENT, comment VARCHAR(255), rating INT(5), id_camp INT, FOREIGN KEY(id_camp) REFERENCES campground(id))";

    con.query(createTableQuery, function (err, result) {
        if (err) {
            console.error('Erro ao criar a tabela:', err);
        } else {
            console.log('Tabela reviews criada com sucesso');
        }
        con.end();
    });
});

function insertReview({ rating, comment, id_camp}, callback) {
    const sql = 'INSERT INTO reviews (rating, comment, id_camp) VALUES (?, ?, ?)';
    const values = [rating, comment, id_camp];

    con.query(sql, values, (err, result) => {
        if (err) {
            console.error('Erro ao inserir a avaliação no MySQL:', err);
            return callback(err, null);
        }

        console.log('1 record inserted');
        callback(null, result);
    });
}

function deleteReview(reviewId, callback) {
    const sql = 'DELETE FROM reviews WHERE id = ?';

    con.query(sql, [reviewId], (error, results) => {
        if (error) {
            console.error('Erro ao excluir a avaliação no MySQL:', error);
            return callback(error, null);
        }

        callback(null, results);
    });
}

module.exports = {
    insertReview,
    deleteReview,
};