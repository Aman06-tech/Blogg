// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "blogg-a4e27.firebaseapp.com",
  projectId: "blogg-a4e27",
  storageBucket: "blogg-a4e27.appspot.com",
  messagingSenderId: "873398132436",
  appId: "1:873398132436:web:ea279dcdd29a520b7e2541"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);