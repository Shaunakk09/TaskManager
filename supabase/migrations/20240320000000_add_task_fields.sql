-- Add new columns to tasks table
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS assignee TEXT,
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS team_members TEXT[] DEFAULT '{}';

-- Add comments to columns
COMMENT ON COLUMN tasks.assignee IS 'The main assignee of the task';
COMMENT ON COLUMN tasks.due_date IS 'The due date of the task';
COMMENT ON COLUMN tasks.priority IS 'The priority level of the task (low, medium, high, urgent)';
COMMENT ON COLUMN tasks.tags IS 'Array of tags associated with the task';
COMMENT ON COLUMN tasks.team_members IS 'Array of team members assigned to the task'; 