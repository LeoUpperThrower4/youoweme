// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB_ClZjCy613nbbRRxE-nqjzudrsSqyQNE",
  authDomain: "youoweme-536a2.firebaseapp.com",
  projectId: "youoweme-536a2",
  storageBucket: "youoweme-536a2.appspot.com",
  messagingSenderId: "18365532280",
  appId: "1:18365532280:web:f61127e117c3378727c58d",
  databaseURL: "https://youoweme-536a2-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);