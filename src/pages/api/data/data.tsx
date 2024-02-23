import type { NextApiRequest, NextApiResponse } from 'next';
import { getDocumentsCollection } from 'src/lib/server/collections';
import { initializeFirebaseAdminApp } from 'src/core/firebase/admin/initialize-firebase-admin-app';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await initializeFirebaseAdminApp();

  if (req.method === 'GET') {
    try {
      const documentsSnapshot = await getDocumentsCollection().get();
      const documents = documentsSnapshot.docs.map(doc => doc.data());

      res.status(200).json(documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).end('Method Not Allowed');
  }
}