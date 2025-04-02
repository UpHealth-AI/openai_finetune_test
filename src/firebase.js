import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBOXSB4McwZh7a3rIFvfz0JEcpDzacArxc",
  authDomain: "joy-chat-app-9a9e0.firebaseapp.com",
  projectId: "joy-chat-app-9a9e0",
  storageBucket: "joy-chat-app-9a9e0.appspot.com", // ✅ fixed here
  messagingSenderId: "1037213212817",
  appId: "1:1037213212817:web:114c138e1cf505c091df30",
  measurementId: "G-0ZRNTTBVQK"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
