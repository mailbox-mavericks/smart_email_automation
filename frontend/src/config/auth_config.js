// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAs90Trqe4dEgXxcs732WtsiBiPeLgoICI",
  authDomain: "emailautomation-f54cf.firebaseapp.com",
  projectId: "emailautomation-f54cf",
  storageBucket: "emailautomation-f54cf.firebasestorage.app",
  messagingSenderId: "452164928861",
  appId: "1:452164928861:web:549accb5573dbef9d154b4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);