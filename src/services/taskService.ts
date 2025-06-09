/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { supabase } from '~/lib/supabase';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  created_at: string;
  user_id: string;
  assignee?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  team_members?: string[];
}

export type CreateTaskInput = Omit<Task, 'id' | 'created_at'>;

const API_URL = '/api';

const getAuthHeader = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    console.error('No access token found in session');
    throw new Error('Not authenticated');
  }
  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  };
};

export const taskService = {
  async getTasks(): Promise<{ data: Task[] | null; error: any }> {
    try {
      const headers = await getAuthHeader();
      console.log('Fetching tasks with headers:', headers);
      const response = await fetch(`${API_URL}/tasks`, {
        headers,
        cache: 'no-store',
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch tasks:', response.status, errorText);
        throw new Error(`Failed to fetch tasks: ${response.status} ${errorText}`);
      }
      const data = await response.json();
      console.log('Received tasks:', data);
      return { data, error: null };
    } catch (error) {
      console.error('Error in getTasks:', error);
      return { data: null, error };
    }
  },

  async createTask(task: CreateTaskInput): Promise<{ data: Task | null; error: any }> {
    try {
      // Validate required fields
      if (!task.title) {
        throw new Error('Title is required');
      }

      // Set default status if not provided
      if (!task.status) {
        task.status = 'todo';
      }

      const headers = await getAuthHeader();
      console.log('Creating task:', task);
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers,
        body: JSON.stringify(task),
        cache: 'no-store',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to create task:', response.status, errorText);
        throw new Error(`Failed to create task: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Task created successfully:', data);
      return { data, error: null };
    } catch (error) {
      console.error('Error in createTask:', error);
      return { data: null, error };
    }
  },

  async updateTask(id: string, task: Partial<Task>): Promise<{ data: Task | null; error: any }> {
    try {
      const headers = await getAuthHeader();
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(task),
        cache: 'no-store',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to update task:', response.status, errorText);
        throw new Error(`Failed to update task: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error('Error in updateTask:', error);
      return { data: null, error };
    }
  },

  async deleteTask(id: string): Promise<{ error: any }> {
    try {
      const headers = await getAuthHeader();
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers,
        cache: 'no-store',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to delete task:', response.status, errorText);
        throw new Error(`Failed to delete task: ${response.status} ${errorText}`);
      }
      
      return { error: null };
    } catch (error) {
      console.error('Error in deleteTask:', error);
      return { error };
    }
  }
}; 