/* eslint-disable @typescript-eslint/consistent-type-imports */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Task } from '~/types/task';
import { taskService } from '~/services/taskService';

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Task) => Promise<void>;
  updateTask: (taskId: string, taskData: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  getTask: (taskId: string) => Task | undefined;
  isLoading: boolean;
  error: string | null;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks on component mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        const result = await taskService.getTasks();
        if (result.success && result.data) {
          setTasks(result.data.map(task => ({
            ...task,
            status: (task.status ?? 'todo') as Task['status']
          })));
        } else {
          setError(result.error ?? 'Failed to fetch tasks');
        }
      } catch (err) {
        setError('An error occurred while fetching tasks');
        console.error('Error fetching tasks:', err);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchTasks();
  }, []);

  const addTask = async (task: Task) => {
    try {
      const result = await taskService.createTask(task);
      if (result.success && result.data) {
        const newTask: Task = {
          ...result.data,
          status: (result.data.status ?? 'todo') as Task['status']
        };
        setTasks(prevTasks => [...prevTasks, newTask]);
      } else {
        setError(result.error ?? 'Failed to create task');
      }
    } catch (err) {
      setError('An error occurred while creating task');
      console.error('Error creating task:', err);
    }
  };

  const updateTask = async (taskId: string, taskData: Partial<Task>) => {
    try {
      const result = await taskService.updateTask(taskId, taskData);
      if (result.success && result.data) {
        const updatedTask: Task = {
          ...result.data,
          status: (result.data.status ?? 'todo') as Task['status']
        };
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === taskId ? updatedTask : task
          )
        );
      } else {
        setError(result.error ?? 'Failed to update task');
      }
    } catch (err) {
      setError('An error occurred while updating task');
      console.error('Error updating task:', err);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const result = await taskService.deleteTask(taskId);
      if (result.success) {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      } else {
        setError(result.error ?? 'Failed to delete task');
      }
    } catch (err) {
      setError('An error occurred while deleting task');
      console.error('Error deleting task:', err);
    }
  };

  const getTask = (taskId: string) => {
    return tasks.find(task => task.id === taskId);
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTask, deleteTask, getTask, isLoading, error }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
} 