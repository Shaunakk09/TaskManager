import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { taskService, type Task } from '~/services/taskService';
import { useAuth } from '~/contexts/AuthContext';
import TaskForm from './TaskForm';
import type { PostgrestError } from '@supabase/supabase-js';

type TaskResponse<T = Task> = {
  data: T | null;
  error: PostgrestError | null;
};

const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      void router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      void fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await taskService.getTasks() as TaskResponse<Task[]>;
      if (error) {
        setError('Failed to fetch tasks');
        return;
      }
      setTasks(data ?? []);
    } catch {
      setError('Failed to fetch tasks');
    }
  };

  const handleCreateTask = async (newTask: Task) => {
    setTasks([newTask, ...tasks]);
    setIsFormOpen(false);
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    if (!editingTask?.id) return;
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    setEditingTask(null);
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const { error } = await taskService.deleteTask(id) as { error: PostgrestError | null };
      if (error) {
        setError('Failed to delete task');
        return;
      }
      setTasks(tasks.filter(t => t.id !== id));
    } catch {
      setError('Failed to delete task');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">My Tasks</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Create Task
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <TaskForm
              onSubmit={handleCreateTask}
              onCancel={() => setIsFormOpen(false)}
              mode="create"
            />
          </div>
        </div>
      )}

      {editingTask && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <TaskForm
              initialTask={editingTask}
              onSubmit={handleUpdateTask}
              onCancel={() => setEditingTask(null)}
              mode="edit"
            />
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                <p className="text-sm text-gray-500 mt-1">Assigned to: {task.assignee ?? 'Unassigned'}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingTask(task)}
                  className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition-colors duration-200"
                  title="Edit task"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors duration-200"
                  title="Delete task"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            <p className="text-gray-500 mb-4 line-clamp-2">{task.description}</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  task.status === 'todo' ? 'bg-yellow-100 text-yellow-800' :
                  task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {task.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Priority:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  task.priority === 'low' ? 'bg-gray-100 text-gray-800' :
                  task.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                  task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {task.priority?.toUpperCase() ?? 'MEDIUM'}
                </span>
              </div>

              {task.due_date && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Due Date:</span>
                  <span className="text-gray-900">
                    {new Date(task.due_date).toLocaleDateString()}
                  </span>
                </div>
              )}

              {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {task.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {task.team_members && task.team_members.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {task.team_members.map((member) => (
                    <span
                      key={member}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
                    >
                      {member}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskManager; 