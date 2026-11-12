-- Initial schema for TaskFlow SaaS application
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo',
  priority TEXT DEFAULT 'medium',
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  due_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'contributor',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects Policies
DROP POLICY IF EXISTS "Members can view projects" ON public.projects;
CREATE POLICY "Members can view projects" ON public.projects FOR SELECT USING (
  owner_id = auth.uid() OR
  id IN (SELECT project_id FROM public.team_members WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Owners can insert projects" ON public.projects;
CREATE POLICY "Owners can insert projects" ON public.projects FOR INSERT WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Owners can update projects" ON public.projects;
CREATE POLICY "Owners can update projects" ON public.projects FOR UPDATE USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Owners can delete projects" ON public.projects;
CREATE POLICY "Owners can delete projects" ON public.projects FOR DELETE USING (owner_id = auth.uid());

-- Tasks Policies
DROP POLICY IF EXISTS "Project participants can view tasks" ON public.tasks;
CREATE POLICY "Project participants can view tasks" ON public.tasks FOR SELECT USING (
  project_id IN (
    SELECT id FROM public.projects WHERE owner_id = auth.uid()
    UNION
    SELECT project_id FROM public.team_members WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Project participants can insert tasks" ON public.tasks;
CREATE POLICY "Project participants can insert tasks" ON public.tasks FOR INSERT WITH CHECK (
  project_id IN (
    SELECT id FROM public.projects WHERE owner_id = auth.uid()
    UNION
    SELECT project_id FROM public.team_members WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Project participants can update tasks" ON public.tasks;
CREATE POLICY "Project participants can update tasks" ON public.tasks FOR UPDATE USING (
  project_id IN (
    SELECT id FROM public.projects WHERE owner_id = auth.uid()
    UNION
    SELECT project_id FROM public.team_members WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Project participants can delete tasks" ON public.tasks;
CREATE POLICY "Project participants can delete tasks" ON public.tasks FOR DELETE USING (
  project_id IN (
    SELECT id FROM public.projects WHERE owner_id = auth.uid()
  )
);

-- Team Members Policies
DROP POLICY IF EXISTS "Project members can view team" ON public.team_members;
CREATE POLICY "Project members can view team" ON public.team_members FOR SELECT USING (
  project_id IN (
    SELECT id FROM public.projects WHERE owner_id = auth.uid()
    UNION
    SELECT project_id FROM public.team_members WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Project owner can insert members" ON public.team_members;
CREATE POLICY "Project owner can insert members" ON public.team_members FOR INSERT WITH CHECK (
  project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Project owner can update members" ON public.team_members;
CREATE POLICY "Project owner can update members" ON public.team_members FOR UPDATE USING (
  project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Project owner can delete members" ON public.team_members;
CREATE POLICY "Project owner can delete members" ON public.team_members FOR DELETE USING (
  project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid())
);

-- Notifications Policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
CREATE POLICY "Users can insert own notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);