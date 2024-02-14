const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const con = require("../database/db");

con.connect((err) => {
  if (err) {
    console.error("Erro ao conectar-se ao banco de dados:", err.stack);
    return;
  }

  console.log("Conectado ao banco de dados.");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  try {
    await new Promise((resolve, reject) => {
      const sql = "DELETE FROM campground";
      con.query(sql, (err, result) => {
        if (err) reject(err);
        console.log("Number of records deleted: " + result.affectedRows);
        resolve();
      });
    });

    for (let i = 0; i < 50; i++) {
      const random1000 = Math.floor(Math.random() * 1000);
      const location = `${cities[random1000].city}, ${cities[random1000].state}`;
      const title = `${sample(descriptors)} ${sample(places)}`;
      const price = 0;
      const description = "";
      const sql = `INSERT INTO campground (title, price, description, location) VALUES ('${title}', '${price}', '${description}', '${location}')`;

      await new Promise((resolve, reject) => {
        con.query(sql, (err, result) => {
          if (err) reject(err);
          console.log("Inserido");
          resolve();
        });
      });
    }
  } catch (error) {
    console.error("Ocorreu um erro:", error);
  }
};

seedDB();
