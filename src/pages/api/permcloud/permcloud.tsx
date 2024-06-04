import type { NextApiRequest, NextApiResponse } from 'next';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, updateDoc, arrayUnion, collection, query, where, getDocs, getDoc } from 'firebase/firestore';

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

const db = getFirestore(app);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { groupId, member } = req.body;
      const groupRef = doc(db, 'groups', groupId);
      const groupDoc = await getDoc(groupRef);
      if (!groupDoc.exists()) {
        throw new Error('Group not found');
      }
      const groupData = groupDoc.data();
      const firstMember = groupData.members[0];
      
      if (!firstMember) {
        throw new Error('No members in the group');
      }

      // Add new permission to the group members
      await updateDoc(groupRef, {
        members: arrayUnion(member),
      });

      // Query all posts where the users array contains the first member
      const postsCollection = collection(db, 'posts');
      const postsQuery = query(postsCollection, where('users', 'array-contains', firstMember));
      const querySnapshot = await getDocs(postsQuery);
      
      const updatedPosts = [];
      const updatedCategories = [];
      for (const postDoc of querySnapshot.docs) {
        const postRef = doc(db, 'posts', postDoc.id);
        await updateDoc(postRef, {
          users: arrayUnion(member),
        });
        updatedPosts.push(postDoc.id);
        updatedCategories.push(postDoc.data().categories);
      }

      res.status(200).json({ message: 'Permission added successfully', updatedPosts, updatedCategories });
    } catch (error) {
      const errMsg = (error instanceof Error) ? error.message : 'Unknown error occurred';
      console.error('Error adding permission:', errMsg);
      res.status(500).json({ error: 'Internal Server Error', details: errMsg });
    }
  } else {
    res.status(405).end('Method Not Allowed');
  }
}
