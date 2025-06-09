/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import type { Task } from '~/services/taskService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Prevent caching
  res.setHeader('Cache-Control', 'no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Get the session token from the request headers
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No authorization token provided' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Invalid authorization token' });
  }

  // Create a new Supabase client with the access token
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }
  );
  
  // Get the user from the token
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('Auth error:', userError);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log('Authenticated user ID:', user.id);

  if (req.method === 'GET') {
    try {
      console.log('Fetching tasks for user:', user.id);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Found tasks:', data?.length || 0);
      res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  } else if (req.method === 'POST') {
    try {
      const task = req.body as Omit<Task, 'id' | 'created_at'>;
      console.log('Creating task:', { ...task, user_id: user.id });

      // Validate required fields
      if (!task.title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      if (!task.status) {
        task.status = 'todo'; // Set default status if not provided
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert([{ 
          ...task, 
          user_id: user.id,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Database error during task creation:', error);
        return res.status(500).json({ 
          error: 'Failed to create task',
          details: error.message 
        });
      }

      console.log('Task created successfully:', data);
      res.status(201).json(data);
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ 
        error: 'Failed to create task',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 