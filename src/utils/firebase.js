// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDtJhqy289QmvpOTKt_qZ8uhpxIgf-G0ec",
  authDomain: "messagisen.firebaseapp.com",
  projectId: "messagisen",
  storageBucket: "messagisen.appspot.com",
  messagingSenderId: "741278327757",
  appId: "1:741278327757:web:b6a9bcbed5cdf336b65a84"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const firestore = getFirestore(app);