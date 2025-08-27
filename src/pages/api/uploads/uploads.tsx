// pages/api/uploads/uploads.ts
<<<<<<< HEAD
import type { NextApiRequest, NextApiResponse } from 'next';
=======
import { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore, serverTimestamp, doc, setDoc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
>>>>>>> 4a7fda7fb94dd7eca68ed843e55f49f24ee8efe3
import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  query,
  collection,
  where,
  getDocs,
} from 'firebase/firestore';

// ---- Firebase client config from env ----
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
<<<<<<< HEAD
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// ---------- Helpers ----------
const toDocIdSafe = (s: string) => s.replace(/\//g, '／'); // your groups doc IDs use full-width slash

const normalize = (s: string) =>
  String(s || '')
    .toLowerCase()
    .replace(/[“”‘’]/g, "'")     // normalize quotes
    .replace(/[＆&]/g, '&')       // normalize ampersand
    .replace(/[／]/g, '/')        // normalize full-width slash back to ASCII
    .replace(/[^a-z0-9/& ]+/gi, ' ') // keep letters/numbers/&/slash/space
    .replace(/\s+/g, ' ')         // collapse whitespace
    .trim();

/**
 * Try to resolve a groups document for a given original filename.
 * Strategy:
 *  1) Use the first segment before " - " as the primary candidate (usually the full partner string).
 *  2) Try remaining segments and the whole base as fallbacks.
 *  3) Optional: query 'groupnames' array, if present.
 *  4) Fallback: normalized full scan across all group doc IDs.
 */
async function resolveGroupDoc(db: ReturnType<typeof getFirestore>, originalFileName: string) {
  const base = originalFileName.replace(/\.(pdf|docx?|xlsx?)$/i, ''); // strip common extensions
  const parts = base.split(' - ').map((p) => p.trim()).filter(Boolean);

  // Order candidates: prefer the first chunk (usually "2024 Partner # X Name")
  const candidates: string[] = [];
  if (parts.length > 0) candidates.push(parts[0]);
  if (parts.length > 1) candidates.push(...parts.slice(1));
  candidates.push(base);

  // 1) Exact doc ID check (path-safe)
  for (const c of candidates) {
    const id = toDocIdSafe(c);
    const ref = doc(db, 'groups', id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return { ref, snap, via: 'exact-id', candidate: c };
    }
  }

  // 2) Optional secondary index: groupnames array
  // If you are not using this field, you can comment this block out safely.
  for (const c of candidates) {
    const qSnap = await getDocs(
      query(collection(db, 'groups'), where('groupnames', 'array-contains', c))
    );
    if (!qSnap.empty) {
      const first = qSnap.docs[0]; // prefer first hit
      return { ref: doc(db, 'groups', first.id), snap: first, via: 'groupnames', candidate: c };
    }
  }

  // 3) Normalized full scan (last resort)
  const all = await getDocs(collection(db, 'groups'));
  const norms = new Set(candidates.map(normalize));
  for (const d of all.docs) {
    const id = d.id;
    const normId = normalize(id);
    if (norms.has(normId)) {
      return { ref: doc(db, 'groups', id), snap: d, via: 'normalized-scan' };
    }
  }

  return null;
}

// ---------- Handler ----------
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Init Firebase app once
    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    const db = getFirestore(app);

    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const encryptedFileName: string | undefined = req.body.fileName;
    const encryptedUrl: string | undefined = req.body.url;
    const originalFileName: string | undefined = req.body.originalFileName;
    const categories: string | string[] | undefined = req.body.categories;
=======
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
>>>>>>> 4a7fda7fb94dd7eca68ed843e55f49f24ee8efe3

    if (!encryptedFileName || !encryptedUrl || !originalFileName) {
      return res.status(400).json({
        error: 'Missing required fields',
<<<<<<< HEAD
        details: { encryptedFileName: !!encryptedFileName, encryptedUrl: !!encryptedUrl, originalFileName: !!originalFileName },
      });
    }

    // Resolve the group by filename
    const resolved = await resolveGroupDoc(db, originalFileName);

    if (!resolved) {
      return res.status(404).json({
        error: `Group not found for filename`,
        details: { originalFileName },
      });
    }

    const { ref: groupDocRef, snap: groupDocSnap, via, candidate } = resolved;
    const groupData = groupDocSnap.data() || {};
    const members: string[] = Array.isArray(groupData.members) ? groupData.members.filter(Boolean) : [];

    // Generate a random doc ID for the post
    const postDocId = Math.random().toString(36).slice(2);

    // Create the post
    const postDocRef = doc(db, 'posts', postDocId);
    await setDoc(postDocRef, {
      image: encryptedFileName,  // encrypted file name
      downloadURL: encryptedUrl, // encrypted URL
      users: members,            // members from matched group
      categories,                // passthrough
      timestamp: serverTimestamp(),
      // Optional: add for audit/debug if you want (safe to remove)
      // matchedGroupId: groupDocRef.id,
      // matchedVia: via,
      // matchedCandidate: candidate ?? null,
=======
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
>>>>>>> 4a7fda7fb94dd7eca68ed843e55f49f24ee8efe3
    });

    return res.status(200).json({
      message: 'File uploaded successfully',
<<<<<<< HEAD
      group: groupDocRef.id,     // exact doc ID used
      matchedVia: via,           // "exact-id" | "groupnames" | "normalized-scan"
      matchedCandidate: candidate ?? null,
      membersCopied: members.length,
      postId: postDocId,
    });
  } catch (error) {
    console.error('Error in uploads handler:', error);
    const message = (error as Error)?.message ?? 'Unknown error';
    return res.status(500).json({ error: 'Internal Server Error', details: message });
=======
      group: groupDocRef.id
    });

  } catch (error) {
    console.error('Error uploading file:', (error as Error).message);
    return res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
>>>>>>> 4a7fda7fb94dd7eca68ed843e55f49f24ee8efe3
  }
}
