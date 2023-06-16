const express = require('express');
const admin = require('firebase-admin');
const cors = require("cors");
const mysql = require('mysql2/promise');
// const { getFirestore } = require("firebase/firestore")
const serviceAccount = require('./serviceAccountKey.json');
const Firestore = require('@google-cloud/firestore');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = new Firestore({
  projectId: 'nutrimate-5d52b',
  keyFilename: './serviceAccountKey.json',
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

/* -------------- Auth Endpoint -------------- */

// Sign up endpoint
app.post('/signup', (req, res) => {
  const { email, password } = req.body;

  admin.auth().createUser({
    email: email,
    password: password,
  })
  .then((userRecord) => {
    console.log('Successfully created new user:', userRecord.uid);
    res.status(200).send('User registered successfully');
  })
  .catch((error) => {
    console.error('Error creating new user:', error);
    res.status(400).send('User registration failed');
  });
});

// Login endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  admin.auth().getUserByEmail(email)
    .then((userRecord) => {
      admin.auth().createCustomToken(userRecord.uid)
        .then((customToken) => {
          res.status(200).json({ token: customToken , uid: userRecord.uid});
        })
        .catch((error) => {
          console.error('Error creating custom token:', error);
          res.status(500).send('Login failed');
        });
      
    })
    .catch((error) => {
      console.error('Error fetching user data:', error);
      res.status(404).send('User not found');
    });
});

// Logout endpoint
app.post('/logout', (req, res) => {
  const idToken = req.headers.authorization;

  admin.auth().verifyIdToken(idToken)
    .then(() => {
      // Clear the user session or perform any other logout logic
      res.status(200).send('Logout successful');
    })
    .catch((error) => {
      console.error('Error verifying ID token:', error);
      res.status(401).send('Logout failed');
    });
});


/* -------------- Snapshot Endpoint -------------- */

// Middleware for authorization
const authorize = (req, res, next) => {
  // Check if Authorization header is present
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Extract the User ID from the Authorization header
  else {
      const userId = req.headers.userd;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
  }
  // const userId = authorizationHeader.split(' ')[1];


  // Add the User ID to the request object for further use
  req.userId = userId;

  // Proceed to the next middleware or route handler
  next();
};

// Store a new snapshot
app.post('/snapshots', async (req, res) => {
  try {
    const userId = req.headers.userid;
    const { kalori, protein, karbohidrat, lemak } = req.body;

    // Create a new Firestore document
    const snapshotRef = await db.collection('snapshots').add({
      userId,
      kalori,
      protein,
      karbohidrat,
      lemak,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    }).then((docRef) => {
      console.log("Document written with ID: ", docRef.id);
    });
    res.status(201).json({message: 'Snapshot stored successfully' });
  } catch (error) {
    console.error('Error storing snapshot:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all snapshots for a user
app.get('/snapshots', async (req, res) => {
  try {
    const userId = req.headers.userid;

    // Query snapshots collection for the specified user ID
    const snapshotDocs = await db.collection('snapshots').where('userId', '==', userId).get();

    const snapshots = [];
    snapshotDocs.forEach((doc) => {
      snapshots.push({ id: doc.id, ...doc.data() });
    });

    res.json({ snapshots });
  } catch (error) {
    console.error('Error retrieving snapshots:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});