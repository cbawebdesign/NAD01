import { NextApiRequest, NextApiResponse } from 'next';
import { initializeApp, getApps} from 'firebase/app';
import { getFirestore, collection, query as firestoreQuery, where, getDocs } from 'firebase/firestore';

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
      const { userName, categories } = req.body as { userName: string, categories: string };
      const postsCollection = collection(db, 'posts');
      const q = firestoreQuery(postsCollection, where('users', 'array-contains', userName), where('categories', '==', categories));
      const postDocsSnapshot = await getDocs(q);
      const posts = postDocsSnapshot.docs.map(doc => ({
        fileName: doc.data().filename,
        url: doc.data().downloadURL,
        image: doc.data().image, // assuming the field in your Firestore document is named 'image'
      }));

      res.status(200).json(posts);
    } catch (error) {
      console.error('Error fetching posts:', (error as Error).message);
      res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
    }
  } else {
    res.status(405).end('Method Not Allowed');
  }
}