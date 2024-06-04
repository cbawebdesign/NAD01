// pages/api/update-user/[userId].ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { getUsersCollection } from 'src/lib/server/collections';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const userId = req.query.userId as string; // Get the user ID from the URL
    console.log('Updating user with ID:', userId); // Log the user ID

    const {
      created,
      email,
      fullName,
      lang,
      lastName,
      name,
      phone,
      photo,
      role,
      userName,
    } = req.body; // Extract the new values from the request body

    // Create an object with only the fields that are not undefined
    const updateData: Partial<{
      created: any;
      email: string;
      fullName: string;
      lang: string;
      lastName: string;
      name: string;
      phone: string;
      photo: string;
      role: string;
      userName: string;
    }> = {};

    if (created !== undefined) updateData.created = created;
    if (email !== undefined) updateData.email = email;
    if (fullName !== undefined) updateData.fullName = fullName;
    if (lang !== undefined) updateData.lang = lang;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (photo !== undefined) updateData.photo = photo;
    if (role !== undefined) updateData.role = role;
    if (userName !== undefined) updateData.userName = userName;

    try {
      // Update the user document in the database
      await getUsersCollection().doc(userId).set(updateData, { merge: true });

      res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).end('Method Not Allowed');
  }
}
