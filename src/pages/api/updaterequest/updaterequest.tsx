import type { NextApiRequest, NextApiResponse } from 'next';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, updateDoc, arrayUnion } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { id, status, note, flagged } = req.body;
      const requestRef = doc(db, 'requests', id);
      const updateData: Partial<{ status: string; notes: unknown; flagged: boolean }> = {};
      if (status) updateData.status = status;
      if (note) updateData.notes = arrayUnion(note);
      if (flagged !== undefined) updateData.flagged = flagged;
      await updateDoc(requestRef, updateData);
      res.status(200).json({ message: 'Request updated successfully' });
    } catch (error) {
      const errMsg = (error instanceof Error) ? error.message : 'Unknown error occurred';
      console.error('Error updating request:', errMsg);
      res.status(500).json({ error: 'Internal Server Error', details: errMsg });
    }
  } else {
    res.status(405).end('Method Not Allowed');
  }
}
