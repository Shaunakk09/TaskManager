import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '~/server/db';

interface SaveDataRequest {
  name: string;
  userId: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const data = req.body as SaveDataRequest;
      
      // Save data to database using Prisma
      const savedData = await prisma.post.create({
        data: {
          name: data.name,
          createdById: data.userId, // Make sure to pass userId from your auth context
        },
      });

      res.status(200).json(savedData);
    } catch (error) {
      console.error('Error saving data:', error);
      res.status(500).json({ error: 'Failed to save data' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 