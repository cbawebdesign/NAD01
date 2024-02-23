// pages/api/update-user/[userId].ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { getUsersCollection } from 'src/lib/server/collections';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const userId = req.query.userId as string; // Get the user ID from the URL
    console.log('Updating user with ID:', userId); // Log the user ID

    const { ChangeDate,Status, FirstName, PreviousTotalPremium, MarkifBW, MM,union, spouse, startdate, LastName, LM, CurrentTotalPremium, CaseNotes } = req.body; // Extract the new values from the request body

    // Create an object with only the fields that are not undefined
    const updateData: Partial<{ ChangeDate:any;FirstName:any; MarkifBW:any; PreviousTotalPremium:any; Status:any;MM: any; union: any; spouse: any; CurrentTotalPremium: any; startdate: any; LM: any; CaseNotes:any;LastName: any; }> = {};
    if (union !== undefined) updateData.union = union;
    if (spouse !== undefined) updateData.spouse = spouse;
    if (startdate !== undefined) updateData.startdate = startdate;
    if (LastName !== undefined) updateData.LastName = LastName;
    if (union !== undefined) updateData.union = union;
    if (CaseNotes !== undefined) updateData.CaseNotes = CaseNotes;
    if (LM !== undefined) updateData.LM = LM;
    if (MM !== undefined) updateData.MM = MM;
    if (MarkifBW !== undefined) updateData.MarkifBW = MarkifBW;
    if (PreviousTotalPremium !== undefined) updateData.PreviousTotalPremium = union;
    if (FirstName !== undefined) updateData.FirstName = FirstName;
    if (Status !== undefined) updateData.Status = Status;
    if (ChangeDate !== undefined) updateData.ChangeDate = ChangeDate;
    if (CurrentTotalPremium !== undefined) updateData.CurrentTotalPremium = union;

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