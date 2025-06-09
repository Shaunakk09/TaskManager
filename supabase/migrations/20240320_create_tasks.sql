-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own tasks
CREATE POLICY "Users can view their own tasks"
    ON public.tasks
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own tasks
CREATE POLICY "Users can insert their own tasks"
    ON public.tasks
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own tasks
CREATE POLICY "Users can update their own tasks"
    ON public.tasks
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own tasks
CREATE POLICY "Users can delete their own tasks"
    ON public.tasks
    FOR DELETE
    USING (auth.uid() = user_id); 