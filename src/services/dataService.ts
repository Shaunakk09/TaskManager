import type { Post } from '@prisma/client';
import { supabase } from '~/lib/supabase';
import type { PostgrestError } from '@supabase/supabase-js';

interface SaveDataRequest {
  name: string;
  userId: string;
}

interface Task {
  id?: string;
  title: string;
  description?: string;
  status?: string;
  user_id?: string;
}

interface SupabaseResponse<T> {
  data: T | null;
  error: PostgrestError | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export const dataService = {
  async saveData(data: SaveDataRequest): Promise<Post> {
    const response = await fetch(`${API_BASE_URL}/api/data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to save data');
    }

    return response.json() as Promise<Post>;
  },

  // Test function to verify Supabase connection
  async testSupabaseConnection() {
    try {
      // Try to fetch tasks
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .limit(1);

      if (error) {
        console.error('Error fetching tasks:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Supabase connection test failed:', error);
      return { success: false, error: 'Connection failed' };
    }
  },

  // Create a new task
  async createTask(task: Task) {
    try {
      const { data, error }: SupabaseResponse<Task> = await supabase
        .from('tasks')
        .insert([task])
        .select()
        .single();

      if (error) {
        console.error('Error creating task:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Failed to create task:', error);
      return { success: false, error: 'Failed to create task' };
    }
  }
}; 