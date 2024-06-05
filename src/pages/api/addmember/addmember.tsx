import type { NextApiRequest, NextApiResponse } from 'next';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, updateDoc, arrayUnion, setDoc, writeBatch } from 'firebase/firestore';
import admin from 'firebase-admin';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = getFirestore(app);
const auth = admin.auth();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { groupId, newMember } = req.body;
      const groupRef = doc(db, 'groups', groupId);

      // Create a new user with Firebase Admin SDK using the provided ID as userName
      const randomPassword = Math.random().toString(36).slice(-8);
      const userRecord = await auth.createUser({
        email: newMember.email,
        password: randomPassword,
        displayName: newMember.name
      });

      // Set custom claims for the user
      await auth.setCustomUserClaims(userRecord.uid, { 
        userName: newMember.id,
        onboarded: true // User is considered onboarded immediately
      });

      // Firestore batch write
      const batch = writeBatch(db);
      
      // Organization document reference
      const organizationRef = doc(db, 'organizations', groupId); // Ensure the groupId matches organizationId
      
      // User document reference
      const userRef = doc(db, 'users', userRecord.uid);
      
      const organizationMembers = {
        [userRecord.uid]: {
          user: userRef,
          role: 'Member', // Assuming the role is 'Member'; adjust as needed
        },
      };

      // Add user to organization's members
      batch.set(organizationRef, {
        members: organizationMembers,
      }, { merge: true });

      // Add the new user to the Firestore 'users' collection
      batch.set(userRef, {
        name: newMember.name,
        email: newMember.email,
        userName: newMember.id,
        createdAt: new Date().toISOString(),
        onboarded: true // User is considered onboarded immediately
      });

      // Commit the batch
      await batch.commit();

      // Log the temporary password in the 'passlogs' Firestore collection
      const passwordLogRef = doc(db, 'passlogs', userRecord.uid);
      await setDoc(passwordLogRef, {
        email: newMember.email,
        tempPassword: randomPassword,
        createdAt: new Date().toISOString()
      });

      // Add the new member to the group's users array
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
  } else {
    res.status(405).end('Method Not Allowed');
  }
}
