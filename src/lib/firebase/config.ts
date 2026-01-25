import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import { getStorage } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: "AIzaSyDW-Ce4GiJAuliNHr0aoIOC5WCL4n3Dkz8",
    authDomain: "myportfolio-753fe.firebaseapp.com",
    projectId: "myportfolio-753fe",
    storageBucket: "myportfolio-753fe.firebasestorage.app",
    messagingSenderId: "1001162430926",
    appId: "1:1001162430926:web:48371575814bf357e4339f"
};

// Initialize Firebase (prevent re-initialization in development with hot reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
