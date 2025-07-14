// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBdsq6FRtTWDUWp1yJqpRJAve8c2eKpVdQ',
  authDomain: 'student-firebase-demo-0712.firebaseapp.com',
  projectId: 'student-firebase-demo-0712',
  storageBucket: 'student-firebase-demo-0712.firebasestorage.app',
  messagingSenderId: '782883298051',
  appId: '1:782883298051:web:e76e0c99bd8002ba522736',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
