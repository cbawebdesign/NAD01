import type { NextApiRequest, NextApiResponse } from 'next';
import { getUsersCollection } from 'src/lib/server/collections';
import { initializeFirebaseAdminApp } from 'src/core/firebase/admin/initialize-firebase-admin-app';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await initializeFirebaseAdminApp();

  if (req.method === 'POST') {
    const { query, union, active, reference, startAfter, limit = 2000 } = req.body;
    
    let queryBuilder: any = getUsersCollection();

    
    if (active !== '' && active !== undefined) {
      queryBuilder = queryBuilder.where('Active', '==', active === 'true');
    }
    
    if (reference !== '' && reference !== undefined) {
      queryBuilder = queryBuilder.where('reference', '==', reference);
    }

    // Order by 'Name' before using 'startAfter'
    queryBuilder = queryBuilder.orderBy('Name');

    if (startAfter && startAfter !== '') {
      const lastUserDoc = await getUsersCollection().doc(startAfter).get();
      if (lastUserDoc.exists) {
        queryBuilder = queryBuilder.startAfter(lastUserDoc);
      }
    }
    queryBuilder = queryBuilder.limit(limit);

    try {
      const snapshot = await queryBuilder.get();
      let users = snapshot.docs.map((doc: { id: any; data: () => any; }) => ({ id: doc.id, ...doc.data() }));

      if (query !== '') {
        users = users.filter((user: any) => user.Name.startsWith(query));
      }

      res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).end('Method Not Allowed');
  }
};

export default handler;
