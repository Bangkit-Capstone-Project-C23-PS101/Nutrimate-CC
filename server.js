const express = require('express');
const admin = require('firebase-admin');
const cors = require("cors");
const mysql = require('mysql2/promise');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(cors({
    "origin": "*"
}));


app.get('/', (req, res) => {
  try{
    res.status(200).send("Hello!, Welcome to Nutrimate BackEnd");
  } catch(e){
    res.status(404).send("Page not found");
  }
})

/* -------------- Snapshot Endpoint -------------- */

// Create MySQL database connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '12345',
  database: 'db_history',
}); 

// Middleware for verifying Firebase ID token
const verifyToken = async (req, res) => {
  // console.log(req.headers.authorization)
  try {
    const idToken = req.headers.authorization;
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    console.log(`Verified users : ${req.user}`)
  } catch (error) {
    console.error('Error verifying ID token:', error);
    res.status(401).send('Unauthorized');
  }
};

// Snapshot storage endpoint
app.post('/snapshot', verifyToken, async (req, res) => {
  const { timestamp, kalori, protein, karbohidrat, lemak } = req.body;
  const userId = req.user.uid;

  try {
    const connection = await pool.getConnection();
    const query = `INSERT INTO snapshots (user_id, timestamp, kalori, protein, karbohidrat, lemak) values (${timestamp},${kalori}, ${protein}, ${karbohidrat}, ${lemak})`;
    await connection.execute(query, [userId, timestamp, kalori, protein, karbohidrat, lemak]);
    connection.release();

    res.status(200).send('Snapshot stored successfully');
  } catch (error) {
    console.error('Error storing snapshot:', error);
    res.status(500).send('Failed to store snapshot');
  }
});

// Snapshot retrieval endpoint
app.get('/snapshot', verifyToken, async (req, res) => {
  const userId = req.user.uid;

  try {
    const connection = await pool.getConnection();
    const query = 'SELECT * FROM snapshots WHERE user_id = ?';
    const [rows] = await connection.execute(query, [userId]);
    connection.release();

    if (rows.length === 0) {
      res.status(404).send('No snapshot found');
    } else {
      res.status(200).json(rows);
    }
  } catch (error) {
    console.error('Error retrieving snapshot:', error);
    res.status(500).send('Failed to retrieve snapshot');
  }
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});