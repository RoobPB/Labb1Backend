const express = require('express');
const app = express();
const { Pool } = require('pg');
const cors = require('cors') // Lagt till för att köra 2 servers

// Connectar till rätt databas
 const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Bibblan',
  password: '321',
  port: 5432
});


async function query(q, values) {
  const client = await pool.connect();
  try {
    const result = await client.query(q, values);
    return result;
  } finally {
    client.release();
  }
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors()) // Tillagd efter dubbel server 28/4

app.get('/', (req, res) => {
    res.send('REST API Server is running');
  });


app.get('/books', async (req, res) => {
    try {
      let result;
      if (req.query.search) {
        result = await query("SELECT books.*, authors.name as author FROM books JOIN authors ON books.author_id = authors.id WHERE authors.name ILIKE '%' || $1 || '%' OR title ILIKE '%' || $1 || '%'", [req.query.search]);
      } else {
        result = await query('SELECT books.*, authors.name as author FROM books JOIN authors ON books.author_id = authors.id');
      }
      res.json(result.rows);
    } catch (err) {
      console.error('Error getting books: ', err);
      res.status(500).send('Error getting books');
    }
  });

app.post('/books', async (req, res) => {
    const { author, title, genre, year } = req.body;
    try {
      let authorResult = await query('SELECT * FROM authors WHERE name = $1', [author]);

      if (authorResult.rowCount === 0) {
        authorResult = await query('INSERT INTO authors (name) VALUES ($1) RETURNING id', [author]);
      }

      const authorId = authorResult.rows[0].id;
      const result = await query(
        'INSERT INTO books (author_id, title, genre, year) VALUES ($1, $2, $3, $4)',
        [authorId, title, genre, year]
      );
      res.status(201).json(result.rows);
    } catch (err) {
      console.error('Error adding book: ', err);
      res.status(500).send('Error adding book');
    }
  });


// Tar bort bok från "books" table i databasen (delete)

app.delete('/books/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await query('DELETE FROM books WHERE id = $1', [id]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error deleting book: ', err);
    res.status(500).send('Error deleting book');
  }
});


app.put('/books/:id', async (req, res) => {
    const id = req.params.id;
    const { author, title, genre, year } = req.body;
    try {
      let authorResult = await query('SELECT * FROM authors WHERE name = $1', [author]);

      if (authorResult.rowCount === 0) {
        authorResult = await query('INSERT INTO authors (name) VALUES ($1) RETURNING id', [author]);
      }

      const authorId = authorResult.rows[0].id;
      const result = await query(
        'UPDATE books SET author_id = $1, title = $2, genre = $3, year = $4 WHERE id = $5',
        [authorId, title, genre, year, id]
      );
      res.status(200).json(result.rows);
    } catch (err) {
      console.error('Error updating book: ', err);
      res.status(500).send('Error updating book');
    }
  });

// Borrow/Lån
app.put('/books/:id/borrow', async (req, res) => {
    const id = req.params.id;
    try {
      const result = await query('UPDATE books SET available = false WHERE id = $1', [id]);
      res.status(200).json(result.rows);
    } catch (err) {
      console.error('Error borrowing book: ', err);
      res.status(500).send('Error borrowing book');
    }
  });

  // Returnerar bok
  app.put('/books/:id/return', async (req, res) => {
    const id = req.params.id;
    try {
      const result = await query('UPDATE books SET available = true WHERE id = $1', [id]);
      res.status(200).json(result.rows);
    } catch (err) {
      console.error('Error returning book: ', err);
      res.status(500).send('Error returning book');
    }
  });

app.listen(4000, () => {
  console.log('REST API server listening on *:4000');
});
