import { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore, serverTimestamp, doc, setDoc, getDoc, query, collection, where, getDocs } from'firebase/firestore';
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
let app;
if (!getApps().length) {
app = initializeApp(firebaseConfig);
} else {
app = getApps()[0];
}
const db = getFirestore(app);

if (req.method === 'POST') {
try {
const encryptedFileName = req.body.fileName;
const originalFileName = req.body.originalFileName; // Get the original file name
const encryptedUrl = req.body.url;
const categories = req.body.categories; // Get the categories from the request body

const docName = originalFileName.split(' - ').pop().replace('.pdf', '');
console.log('Document name:', docName);

// Fetch the group document by name
let groupDocRef = doc(db, 'groups', docName);
let groupDocSnap = await getDoc(groupDocRef);

// If group document doesn't exist, search for it in groupnames array
if (!groupDocSnap.exists()) {
const q = query(collection(db, 'groups'), where('groupnames', 'array-contains', docName));
const querySnapshot = await getDocs(q);
if (!querySnapshot.empty) {
groupDocSnap = querySnapshot.docs[0];
}
}

if (groupDocSnap.exists()) {
const groupData = groupDocSnap.data();
const members = groupData?.members || [];

// Generate a random string for the post document name
const postDocName = Math.random().toString(36).substring(2);

// Create a new post document
const postDocRef = doc(db, 'posts', postDocName);
await setDoc(postDocRef, {
image: encryptedFileName, // Use the encrypted fileName here
downloadURL: encryptedUrl,
users: members,
categories: categories, // Add the categories field
timestamp: serverTimestamp(), // Add the timestamp field
});

res.status(200).json({ message: 'File uploaded successfully', group: docName });
} else {
res.status(404).json({ error: `Group '${docName}' not found` });
}
} catch (error) {
console.error('Error uploading file:', (error as Error).message);
res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
}
} else {
res.status(405).end('Method Not Allowed');
}
}