import { NextResponse, NextRequest } from 'next/server';
import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    try {
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

      if (!serviceAccountPath) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH environment variable is not set.');
      }

      const fullPath = path.resolve(process.cwd(), serviceAccountPath);

      if (!fs.existsSync(fullPath)) {
        throw new Error(`Firebase service account file not found at: ${fullPath}`);
      }

      const serviceAccount = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (error) {
      console.error('Firebase Admin SDK initialization error:', error);
      throw error;
    }
  }
}

initializeFirebaseAdmin();

const db = admin.firestore();

export async function POST(req: NextRequest) {
  const idToken = req.headers.get('Authorization')?.split('Bearer ')[1];

  if (!idToken) {
    return NextResponse.json({ message: 'Authorization token not provided' }, { status: 401 });
  }

  let userEmail: string;
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    if (!decodedToken.email) {
      throw new Error('User email not found in token.');
    }
    userEmail = decodedToken.email;
  } catch (error) {
    console.error('Error verifying Firebase ID token or extracting email:', error);
    return NextResponse.json({ message: 'Unauthorized: Invalid or expired token' }, { status: 401 });
  }

  const body = await req.json();
  const { firstName, lastName, gender, country } = body;

  if (
    typeof firstName !== 'string' || firstName.trim() === '' ||
    typeof lastName !== 'string' || lastName.trim() === '' ||
    typeof gender !== 'string' || gender.trim() === '' ||
    typeof country !== 'string' || country.trim() === ''
  ) {
    return NextResponse.json({ message: 'Invalid or missing user data fields' }, { status: 400 });
  }

  try {
    const userProfileDocRef = db.collection('users').doc(userEmail);

    const userData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      gender: gender.trim(),
      country: country.trim(),
      email: userEmail,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await userProfileDocRef.set(userData, { merge: true });

    return NextResponse.json({ message: 'User data successfully stored', email: userEmail }, { status: 200 });
  } catch (error) {
    console.error('Error storing user data:', error);
    return NextResponse.json({ message: 'Internal Server Error: Could not store user data' }, { status: 500 });
  }
}
