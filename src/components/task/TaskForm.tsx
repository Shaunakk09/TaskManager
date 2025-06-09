import { useState, useRef } from 'react';
import { taskService, type Task } from '~/services/taskService';
import { useAuth } from '~/contexts/AuthContext';

interface TaskFormProps {
  initialTask?: Partial<Task>;
  onSubmit: (task: Task) => void;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

const TaskForm = ({ initialTask, onSubmit, onCancel, mode }: TaskFormProps) => {
  const { user } = useAuth();
  const [task, setTask] = useState<Partial<Task>>(initialTask ?? {
    title: '',
    description: '',
    assignee: '',
    status: 'todo',
    due_date: '',
    priority: 'medium',
    tags: [],
    team_members: [],
    user_id: user?.id,
  });
  const [newTag, setNewTag] = useState('');
  const [newTeamMember, setNewTeamMember] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isSubmitting = useRef(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Title validation
    if (!task.title?.trim()) {
      newErrors.title = 'Title is required';
    } else if (task.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters long';
    } else if (task.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    // Description validation
    if (task.description && task.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    // Assignee validation
    if (!task.assignee?.trim()) {
      newErrors.assignee = 'Assignee is required';
    }

    // Due date validation
    if (!task.due_date?.trim()) {
      newErrors.due_date = 'Due date is required';
    } else {
      const dueDate = new Date(task.due_date);
      if (dueDate < today) {
        newErrors.due_date = 'Due date cannot be in the past';
      }
    }

    // Priority validation
    if (!task.priority) {
      newErrors.priority = 'Priority is required';
    }

    // Tags validation
    if (task.tags && task.tags.length > 5) {
      newErrors.tags = 'Maximum 5 tags allowed';
    }

    // Team members validation
    if (task.team_members && task.team_members.length > 10) {
      newErrors.team_members = 'Maximum 10 team members allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (isSubmitting.current) {
      return;
    }

    if (validateForm()) {
      // Ensure user is available before attempting to create/update tasks
      if (!user?.id) {
        setErrors({ ...errors, submit: 'User not authenticated. Please log in again.' });
        return;
      }

      try {
        isSubmitting.current = true;
        let result;
        if (mode === 'create') {
          // Remove any id field and ensure user_id is set
          const { ...taskData } = task;
          if (!taskData.title) { // user?.id check already done above
            setErrors({ ...errors, submit: 'Missing required fields.' });
            return;
          }
          result = await taskService.createTask({
            ...taskData,
            title: taskData.title,
            user_id: user.id,
            status: taskData.status ?? 'todo'
          });
        } else {
          if (!initialTask?.id) {
            setErrors({ ...errors, submit: 'Task ID is missing. Cannot update task.' });
            return;
          }
          result = await taskService.updateTask(initialTask.id, task);
        }
        
        if (result.data) {
          onSubmit(result.data);
        } else {
          console.error('Failed to save task:', result.error);
          setErrors({ ...errors, submit: 'Failed to save task. Please try again.' });
        }
      } catch (error) {
        console.error('Failed to save task:', error);
        setErrors({ ...errors, submit: 'Failed to save task. Please try again.' });
      } finally {
        isSubmitting.current = false;
      }
    }
  };

  const addTag = () => {
    if (newTag.trim()) {
      if (task.tags?.length && task.tags.length >= 5) {
        setErrors({ ...errors, tags: 'Maximum 5 tags allowed' });
        return;
      }
      if (!task.tags?.includes(newTag.trim())) {
        setTask({
          ...task,
          tags: [...(task.tags ?? []), newTag.trim()]
        });
        setNewTag('');
        setErrors({ ...errors, tags: '' });
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTask({
      ...task,
      tags: task.tags?.filter(tag => tag !== tagToRemove) ?? []
    });
  };

  const addTeamMember = () => {
    if (newTeamMember.trim()) {
      if (task.team_members?.length && task.team_members.length >= 10) {
        setErrors({ ...errors, team_members: 'Maximum 10 team members allowed' });
        return;
      }
      if (!task.team_members?.includes(newTeamMember.trim())) {
        setTask({
          ...task,
          team_members: [...(task.team_members ?? []), newTeamMember.trim()]
        });
        setNewTeamMember('');
        setErrors({ ...errors, team_members: '' });
      }
    }
  };

  const removeTeamMember = (memberToRemove: string) => {
    setTask({
      ...task,
      team_members: task.team_members?.filter(member => member !== memberToRemove) ?? []
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={task.title}
            onChange={(e) => {
              setTask({ ...task, title: e.target.value });
              setErrors({ ...errors, title: '' });
            }}
            className={`mt-1 block w-full rounded-md border ${errors.title ? 'border-red-500' : 'border-indigo-500'} px-4 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
            required
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-500">{errors.title}</p>
          )}
        </div>
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
            Priority <span className="text-red-500">*</span>
          </label>
          <select
            id="priority"
            value={task.priority}
            onChange={(e) => {
              setTask({ ...task, priority: e.target.value as Task['priority'] });
              setErrors({ ...errors, priority: '' });
            }}
            className={`mt-1 block w-full rounded-md border ${errors.priority ? 'border-red-500' : 'border-indigo-500'} px-4 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          {errors.priority && (
            <p className="mt-1 text-sm text-red-500">{errors.priority}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={task.description}
          onChange={(e) => {
            setTask({ ...task, description: e.target.value });
            setErrors({ ...errors, description: '' });
          }}
          rows={4}
          className={`mt-1 block w-full rounded-md border ${errors.description ? 'border-red-500' : 'border-indigo-500'} px-4 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
          maxLength={500}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">{errors.description}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          {task.description?.length ?? 0}/500 characters
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="assignee" className="block text-sm font-medium text-gray-700">
            Main Assignee <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="assignee"
            value={task.assignee}
            onChange={(e) => {
              setTask({ ...task, assignee: e.target.value });
              setErrors({ ...errors, assignee: '' });
            }}
            className={`mt-1 block w-full rounded-md border ${errors.assignee ? 'border-red-500' : 'border-indigo-500'} px-4 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
            required
          />
          {errors.assignee && (
            <p className="mt-1 text-sm text-red-500">{errors.assignee}</p>
          )}
        </div>
        <div>
          <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
            Due Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="due_date"
            value={task.due_date}
            onChange={(e) => {
              setTask({ ...task, due_date: e.target.value });
              setErrors({ ...errors, due_date: '' });
            }}
            min={new Date().toISOString().split('T')[0]}
            className={`mt-1 block w-full rounded-md border ${errors.due_date ? 'border-red-500' : 'border-indigo-500'} px-4 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
            required
          />
          {errors.due_date && (
            <p className="mt-1 text-sm text-red-500">{errors.due_date}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Tags {task.tags?.length ? `(${task.tags.length}/5)` : ''}
        </label>
        <div className="mt-1 flex flex-wrap gap-2">
          {task.tags?.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 inline-flex items-center"
              >
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </span>
          ))}
        </div>
        <div className="mt-2 flex">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className={`block w-full rounded-l-md border ${errors.tags ? 'border-red-500' : 'border-indigo-500'} px-4 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
            placeholder="Add a tag"
            maxLength={20}
          />
          <button
            type="button"
            onClick={addTag}
            className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:bg-gray-100"
          >
            Add
          </button>
        </div>
        {errors.tags && (
          <p className="mt-1 text-sm text-red-500">{errors.tags}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Team Members {task.team_members?.length ? `(${task.team_members.length}/10)` : ''}
        </label>
        <div className="mt-1 flex flex-wrap gap-2">
          {task.team_members?.map((member) => (
            <span
              key={member}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
            >
              {member}
              <button
                type="button"
                onClick={() => removeTeamMember(member)}
                className="ml-1 inline-flex items-center"
              >
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </span>
          ))}
        </div>
        <div className="mt-2 flex">
          <input
            type="text"
            value={newTeamMember}
            onChange={(e) => setNewTeamMember(e.target.value)}
            className={`block w-full rounded-l-md border ${errors.team_members ? 'border-red-500' : 'border-indigo-500'} px-4 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
            placeholder="Add a team member"
            maxLength={50}
          />
          <button
            type="button"
            onClick={addTeamMember}
            className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:bg-gray-100"
          >
            Add
          </button>
        </div>
        {errors.team_members && (
          <p className="mt-1 text-sm text-red-500">{errors.team_members}</p>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          {mode === 'create' ? 'Create Task' : 'Update Task'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm; 