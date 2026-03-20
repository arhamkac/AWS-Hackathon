import { getAuth, GoogleAuthProvider } from "firebase/auth";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "digitaltwinai-49f79.firebaseapp.com",
  projectId: "digitaltwinai-49f79",
  storageBucket: "digitaltwinai-49f79.firebasestorage.app",
  messagingSenderId: "1025592053751",
  appId: "1:1025592053751:web:3a47143582744dc96b68f2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth=getAuth(app)
const provider = new GoogleAuthProvider();
export {auth,provider}
