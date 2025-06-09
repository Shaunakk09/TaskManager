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

export const taskService = {
  async getTasks(): Promise<{ data: Task[] | null; error: any }> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  async createTask(task: CreateTaskInput): Promise<{ data: Task | null; error: any }> {
    // Log the current authenticated user ID from Supabase
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Supabase auth.uid() at createTask:', user?.id);
    console.log('Task data user_id:', task.user_id);
    
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single();
    
    return { data, error };
  },

  async updateTask(id: string, task: Partial<Task>): Promise<{ data: Task | null; error: any }> {
    const { data, error } = await supabase
      .from('tasks')
      .update(task)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  },

  async deleteTask(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    return { error };
  }
}; 