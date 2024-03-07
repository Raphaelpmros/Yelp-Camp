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
      const sqlDeleteReviews = "DELETE FROM reviews WHERE id_camp IN (SELECT id FROM campground)";
      con.query(sqlDeleteReviews, (err, result) => {
        if (err) reject(err);
        console.log("Número de registros deletados em reviews: " + result.affectedRows);
        resolve();
      });
    });

    await new Promise((resolve, reject) => {
      const sqlDeleteCampground = "DELETE FROM campground";
      con.query(sqlDeleteCampground, (err, result) => {
        if (err) reject(err);
        console.log("Número de registros deletados em campground: " + result.affectedRows);
        resolve();
      });
    });

    for (let i = 0; i < 50; i++) {
      const random1000 = Math.floor(Math.random() * 1000);
      const priceRandom = Math.floor(Math.random() * 20) + 10;
      const location = `${cities[random1000].city}, ${cities[random1000].state}`;
      const title = `${sample(descriptors)} ${sample(places)}`;
      const price = priceRandom;
      const description = "dasndjnasidsidnasidnsajdna asjdnaijdnsjidnaijdnjaisnaidnsad nasjidasijdnijdnasjidnaidnifbehbefhuwbfew ibfirgpwfwep oeifjweiofje wfpowejfpwe ofiejfow fjeop";
      const sqlInsertCampground = `INSERT INTO campground (title, price, description, location, image, author) VALUES ('${title}', '${price}', '${description}', '${location}', '["https://res.cloudinary.com/dhafchcdg/image/upload/v1709755016/YelpCamp/xjbb3qquezd9erpzuah8.png","https://res.cloudinary.com/dhafchcdg/image/upload/v1709755017/YelpCamp/j6i5aie1a0fdkbf7kmgl.png","https://res.cloudinary.com/dhafchcdg/image/upload/v1709755018/YelpCamp/u0f5k7sbb8nn45drs63z.png","https://res.cloudinary.com/dhafchcdg/image/upload/v1709755023/YelpCamp/shqmfpfzbyk4ttriqcsw.png","https://res.cloudinary.com/dhafchcdg/image/upload/v1709756049/YelpCamp/u4jfvat9s87nnvfykski.png","https://res.cloudinary.com/dhafchcdg/image/upload/v1709756052/YelpCamp/pxx2rgsg6l8iwk9lbhbc.png","https://res.cloudinary.com/dhafchcdg/image/upload/v1709756796/YelpCamp/rh3dube5jvgpmqcj8ts3.png"]', 2)`;

      await new Promise((resolve, reject) => {
        con.query(sqlInsertCampground, (err, result) => {
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
