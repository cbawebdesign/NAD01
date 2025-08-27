// pages/api/uploads/uploads.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore, serverTimestamp, doc, setDoc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// 👇 change this if your fallback doc id is different
const DEFAULT_GROUP_ID = 'test group';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // init app
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  const db = getFirestore(app);

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const encryptedFileName = req.body.fileName as string | undefined;
    const originalFileName  = req.body.originalFileName as string | undefined;
    const encryptedUrl      = req.body.url as string | undefined;
    const categories        = req.body.categories; // string or string[]

    if (!encryptedFileName || !encryptedUrl || !originalFileName) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: {
          fileName: !!encryptedFileName,
          url: !!encryptedUrl,
          originalFileName: !!originalFileName
        }
      });
    }

    // --- original docName parsing you had ---
    const docName = originalFileName.split(' - ').pop()?.replace(/\.pdf$/i, '') ?? originalFileName;
    console.log('Document name:', docName);

    // Try direct doc id match first
    let groupDocRef = doc(db, 'groups', docName);
    let groupDocSnap = await getDoc(groupDocRef);

    // If not found, try groupnames array-contains
    if (!groupDocSnap.exists()) {
      const q = query(collection(db, 'groups'), where('groupnames', 'array-contains', docName));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        groupDocSnap = querySnapshot.docs[0];
        groupDocRef = doc(db, 'groups', groupDocSnap.id);
      }
    }

    // 👉 fallback: test group
    if (!groupDocSnap.exists()) {
      console.warn(`Group '${docName}' not found; falling back to '${DEFAULT_GROUP_ID}'`);
      const fallbackRef = doc(db, 'groups', DEFAULT_GROUP_ID);
      const fallbackSnap = await getDoc(fallbackRef);

      const fallbackMembers = (fallbackSnap.exists() && Array.isArray(fallbackSnap.data()?.members))
        ? fallbackSnap.data()!.members
        : [];

      // create post with fallback members
      const postDocName = Math.random().toString(36).substring(2);
      const postDocRef  = doc(db, 'posts', postDocName);

      await setDoc(postDocRef, {
        image: encryptedFileName,   // encrypted fileName
        downloadURL: encryptedUrl,  // encrypted URL
        users: fallbackMembers,     // fallback members (empty if test group missing)
        categories: categories,
        timestamp: serverTimestamp(),
      });

      return res.status(200).json({
        message: `File uploaded using fallback group`,
        group: DEFAULT_GROUP_ID
      });
    }

    // Found a group (direct or via groupnames)
    const groupData = groupDocSnap.data();
    const members   = Array.isArray(groupData?.members) ? groupData!.members : [];

    // Create post doc
    const postDocName = Math.random().toString(36).substring(2);
    const postDocRef  = doc(db, 'posts', postDocName);

    await setDoc(postDocRef, {
      image: encryptedFileName,   // encrypted fileName
      downloadURL: encryptedUrl,  // encrypted URL
      users: members,             // members from matched group
      categories: categories,     // passthrough
      timestamp: serverTimestamp()
    });

    return res.status(200).json({
      message: 'File uploaded successfully',
      group: groupDocRef.id
    });

  } catch (error) {
    console.error('Error uploading file:', (error as Error).message);
    return res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
  }
}
