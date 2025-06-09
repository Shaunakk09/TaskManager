export interface Task {
  id?: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed';
  user_id?: string;
  created_at?: string;
  assignee?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  team_members?: string[];
  attachments?: string[];
  comments?: string[];
}

export interface ValidationErrors {
  title?: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  priority?: string;
  tags?: string;
  teamMembers?: string;
  submit?: string;
} 