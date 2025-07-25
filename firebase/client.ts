// Import the functions you need from the SDKs you need
import { initializeApp,getApps,getApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyDhfjh2Nsx-ZjrERXnT7JXgw6MbT0sniSk",
  authDomain: "crackit-2bf4e.firebaseapp.com",
  projectId: "crackit-2bf4e",
  storageBucket: "crackit-2bf4e.firebasestorage.app",
  messagingSenderId: "821912614688",
  appId: "1:821912614688:web:29641c586946ccbe740945",
  measurementId: "G-7LC4PWGRHY"
};

// Initialize Firebase
const app = !getApps.length? initializeApp(firebaseConfig): getApp();

export const auth=getAuth(app);
export const db=getFirestore(app);