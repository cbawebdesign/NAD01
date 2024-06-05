import type { NextApiRequest, NextApiResponse } from 'next';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, updateDoc, arrayUnion, setDoc, writeBatch } from 'firebase/firestore';
import admin from 'firebase-admin';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = getFirestore(app);
const auth = admin.auth();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).end('Method Not Allowed');
    return;
  }

  try {
    const { groupId, newMember } = JSON.parse(req.body); // Ensure the body is being parsed as JSON

    const groupRef = doc(db, 'groups', groupId);

    const randomPassword = Math.random().toString(36).slice(-8);
    const userRecord = await auth.createUser({
      email: newMember.email,
      password: randomPassword,
      displayName: newMember.name
    });

    await auth.setCustomUserClaims(userRecord.uid, { 
      userName: newMember.id,
      onboarded: true
    });

    const batch = writeBatch(db);
    const organizationRef = doc(db, 'organizations', groupId);
    const userRef = doc(db, 'users', userRecord.uid);

    const organizationMembers = {
      [userRecord.uid]: {
        user: userRef,
        role: 'Member',
      },
    };

    batch.set(organizationRef, {
      members: organizationMembers,
    }, { merge: true });

    batch.set(userRef, {
      name: newMember.name,
      email: newMember.email,
      userName: newMember.id,
      createdAt: new Date().toISOString(),
      onboarded: true
    });

    await batch.commit();

    const passwordLogRef = doc(db, 'passlogs', userRecord.uid);
    await setDoc(passwordLogRef, {
      email: newMember.email,
      tempPassword: randomPassword,
      createdAt: new Date().toISOString()
    });

    await updateDoc(groupRef, {
      users: arrayUnion({
        id: userRecord.uid,
        name: newMember.name,
        email: newMember.email
      }),
    });

    res.status(200).json({ message: 'Member added and user account created successfully' });
  } catch (error) {
    const errMsg = (error instanceof Error) ? error.message : 'Unknown error occurred';
    console.error('Error adding member:', errMsg);
    res.status(500).json({ error: 'Internal Server Error', details: errMsg });
  }
}
