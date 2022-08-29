const express = require("express");
const port = process.env.PORT || 8005;
const app = express();

app.use(express.static(__dirname + "/public"));

const mysql = require("mysql2");
const connection = mysql.createConnection({
  host: "localhost",
  user: "jeff",
  password: "jeff",
  database: "coding",
});

connection.connect();

app.get("/", (req, res) => {
  res.sendFile("views/index.html", { root: __dirname });
});

app.get("/api/movies", (req, res) => {
  connection.query(
    "SELECT movies.id, title, summary, genres.name as genre_name FROM movies INNER JOIN genres ON movies.genre_id = genres.id ORDER BY id asc LIMIT 20",
    function (error, results, fields) {
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.json({ movies: results });
    }
  );
});

app.get("/api/search", (req, res) => {
  const title = req.query.title;
  connection.query(
    `SELECT movies.id, title, summary, genres.name as genre_name
        FROM movies
        INNER JOIN genres
        ON movies.genre_id = genres.id
        WHERE title like "%${title}%"
        OR summary like "%${title}%"
        ORDER BY id asc
        LIMIT 10`,
    function (error, results, fields) {
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.json({ movies: results });
    }
  );
});

app.get("/api/movies/:id", (req, res) => {
  connection.query(
    `SELECT * FROM movies where id = ${req.params.id}`,
    function (error, results, fields) {
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.json({ movie: results[0] });
    }
  );
});

app.get("/api/movies/:id/genres", (req, res) => {
  connection.query(
    `SELECT genres.* FROM movies INNER JOIN genres ON movies.genre_id = genres.id WHERE movies.id = ${req.params.id}`,
    function (error, results, fields) {
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.json({ genre: results[0] });
    }
  );
});

app.get("/api/movies/:id/producers", (req, res) => {
  connection.query(
    `SELECT producers.* FROM movies INNER JOIN producers ON movies.producer_id = producers.id WHERE movies.id = ${req.params.id}`,
    function (error, results, fields) {
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.json({ producer: results[0] });
    }
  );
});

app.get("/api/home-infinite", (req, res) => {
  const perPage = req.query.perPage || 20;
  const page = req.query.page || 1;
  const startAt = perPage * (page - 1);

  connection.query(
    `SELECT movies.id, title, summary, genres.name as genre_name
        FROM movies
        INNER JOIN genres
        ON movies.genre_id = genres.id
        ORDER BY id asc LIMIT ${startAt}, ${perPage}`,
    function (error, results, fields) {
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.json({ movies: results });
    }
  );
});

app.listen(port, () => {
  console.log(`J-Movies app listening at http://localhost:${port}`);
});
