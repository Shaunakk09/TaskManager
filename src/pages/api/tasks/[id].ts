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
    'https://gyqbypcxwcvkfspzqvpl.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5cWJ5cGN4d2N2a2ZzcHpxdnBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNTgyNDYsImV4cCI6MjA2NDkzNDI0Nn0.Zf1uRkD3oDzvKCplhKe883Q00C5IrFOFSytJA1t9SFo',
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

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Task ID is required' });
  }

  // First, verify that the task belongs to the current user
  const { data: existingTask, error: fetchError } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (fetchError) {
    console.error('Task fetch error:', fetchError);
    if (fetchError.code === 'PGRST116') {
      return res.status(404).json({ error: 'Task not found or you do not have permission to access it' });
    }
    return res.status(500).json({ error: 'Failed to verify task ownership' });
  }

  if (!existingTask) {
    return res.status(404).json({ error: 'Task not found' });
  }

  if (req.method === 'PUT') {
    try {
      const task = req.body as Partial<Task>;
      const { data, error } = await supabase
        .from('tasks')
        .update(task)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      res.status(200).json(data);
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  } else if (req.method === 'DELETE') {
    try {
      console.log('Deleting task:', id);
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Database error during deletion:', error);
        return res.status(500).json({ 
          error: 'Failed to delete task',
          details: error.message 
        });
      }

      console.log('Task deleted successfully');
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ 
        error: 'Failed to delete task',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 