// firebaseAdmin.js
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Only initialize Firebase if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        project_id: process.env.FIREBASE_PROJECT_ID,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error.message);
    // Initialize without Firebase for now
    console.log('⚠️ Running without Firebase Admin features');
  }
}

export default admin;