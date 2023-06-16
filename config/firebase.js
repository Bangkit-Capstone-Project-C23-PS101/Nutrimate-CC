const firebase = require("firebase/app");
require("firebase/auth");
require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyAFVhA1K9NYSm7XH_3ZEg6vvJX2HdsELzk",
  authDomain: "nutrimate-5d52b.firebaseapp.com",
  databaseURL: "https://nutrimate-5d52b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "nutrimate-5d52b",
  storageBucket: "nutrimate-5d52b.appspot.com",
  messagingSenderId: "1006171338044",
  appId: "1:1006171338044:web:b23c8e6efc48ed6e071a39",
  measurementId: "G-5810HL2FHZ"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth; 

module.exports = firebaseConfig;