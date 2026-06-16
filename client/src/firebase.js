import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDV_fd-l-FYic7uPnLU4BjiaiWeudEK98E",
  authDomain: "blogg-a4e27.firebaseapp.com",
  projectId: "blogg-a4e27",
  storageBucket: "blogg-a4e27.appspot.com",
  messagingSenderId: "873398132436",
  appId: "1:873398132436:web:ea279dcdd29a520b7e2541",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
