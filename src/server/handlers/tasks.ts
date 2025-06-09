/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createClient } from '@supabase/supabase-js';
import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import type { Task } from '~/services/taskService';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

// Get all tasks
export const getTasks: APIGatewayProxyHandlerV2 = async () => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch tasks' }),
    };
  }
};

// Create a new task
export const createTask: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Task data is required' }),
      };
    }

    const task = JSON.parse(event.body) as Omit<Task, 'id' | 'created_at'>;
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single();

    if (error) throw error;

    return {
      statusCode: 201,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create task' }),
    };
  }
};

// Update a task
export const updateTask: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    if (!event.pathParameters?.id || !event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Task ID and update data are required' }),
      };
    }

    const taskId = event.pathParameters.id;
    const updates = JSON.parse(event.body) as Partial<Task>;

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to update task' }),
    };
  }
};

// Delete a task
export const deleteTask: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    if (!event.pathParameters?.id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Task ID is required' }),
      };
    }

    const taskId = event.pathParameters.id;
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;

    return {
      statusCode: 204,
      body: '',
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to delete task' }),
    };
  }
}; 