-- Enable RLS для всіх таблиць
alter default privileges revoke execute on functions from public;
alter default privileges in schema public revoke execute on functions from anon;

-- Створення таблиці users (БЕЗ password - використовуємо Supabase Auth)
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  name text not null,
  avatar text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Створення таблиці projects
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  color text default '#1976d2' not null,
  archived boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references public.users(id) on delete cascade not null
);

-- Створення таблиці tasks
create table if not exists public.tasks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  status text default 'TODO' not null,
  priority text default 'MEDIUM' not null,
  due_date timestamp with time zone,
  completed_at timestamp with time zone,
  archived boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references public.users(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete set null
);

-- Створення таблиці tags
create table if not exists public.tags (
  id uuid default gen_random_uuid() primary key,
  name text unique not null,
  color text default '#666666' not null,
  created_at timestamp with time zone default timezone('utc'::text, now') not null,
  updated_at timestamp with time zone default timezone('utc'::text, now') not null
);

-- Створення таблиці task_tags (many-to-many)
create table if not exists public.task_tags (
  task_id uuid references public.tasks(id) on delete cascade not null,
  tag_id uuid references public.tags(id) on delete cascade not null,
  primary key (task_id, tag_id)
);

-- Створення таблиці time_entries
create table if not exists public.time_entries (
  id uuid default gen_random_uuid() primary key,
  description text,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone,
  duration integer,
  is_running boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now') not null,
  updated_at timestamp with time zone default timezone('utc'::text, now') not null,
  user_id uuid references public.users(id) on delete cascade not null,
  task_id uuid references public.tasks(id) on delete cascade not null
);

-- Створення таблиці notifications
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  message text not null,
  type text default 'INFO' not null,
  read boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now') not null,
  updated_at timestamp with time zone default timezone('utc'::text, now') not null,
  user_id uuid references public.users(id) on delete cascade not null
);

-- Створення таблиці user_filters
create table if not exists public.user_filters (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  filters text not null, -- JSON string
  created_at timestamp with time zone default timezone('utc'::text, now') not null,
  updated_at timestamp with time zone default timezone('utc'::text, now') not null,
  user_id uuid references public.users(id) on delete cascade not null,
  unique(user_id, name)
);

-- Створення таблиці reminder_settings
create table if not exists public.reminder_settings (
  id uuid default gen_random_uuid() primary key,
  email_reminders boolean default true not null,
  push_notifications boolean default true not null,
  reminder_frequency text default 'DAILY' not null,
  days_before_deadline integer default 1 not null,
  custom_reminder_times text, -- JSON array
  quiet_hours_start text,
  quiet_hours_end text,
  weekend_reminders boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now') not null,
  updated_at timestamp with time zone default timezone('utc'::text, now') not null,
  user_id uuid references public.users(id) on delete cascade not null unique
);

-- Створення таблиці scheduled_reminders
create table if not exists public.scheduled_reminders (
  id uuid default gen_random_uuid() primary key,
  type text not null,
  scheduled_for timestamp with time zone not null,
  sent boolean default false not null,
  title text not null,
  message text not null,
  metadata text, -- JSON
  created_at timestamp with time zone default timezone('utc'::text, now') not null,
  updated_at timestamp with time zone default timezone('utc'::text, now') not null,
  user_id uuid references public.users(id) on delete cascade not null,
  task_id uuid references public.tasks(id) on delete cascade
);

-- Функція для автоматичного створення користувача в таблиці users після реєстрації
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    name,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', 'User'),
    new.created_at,
    new.created_at
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY definer;

-- Тригер який викликається після створення нового користувача в auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Створення індексів для покращення продуктивності
create index if not exists idx_users_email on public.users(email);
create index if not exists idx_projects_user_id on public.projects(user_id);
create index if not exists idx_tasks_user_id on public.tasks(user_id);
create index if not exists idx_tasks_project_id on public.tasks(project_id);
create index if not exists idx_tasks_status on public.tasks(status);
create index if not exists idx_tasks_due_date on public.tasks(due_date);
create index if not exists idx_time_entries_user_id on public.time_entries(user_id);
create index if not exists idx_time_entries_task_id on public.time_entries(task_id);
create index if not exists idx_notifications_user_id on public.notifications(user_id);

-- Функція для автоматичного оновлення updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Тригери для автоматичного оновлення updated_at
create trigger handle_updated_at before update on public.users for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at before update on public.projects for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at before update on public.tasks for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at before update on public.tags for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at before update on public.time_entries for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at before update on public.notifications for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at before update on public.user_filters for each row execute procedure public.handle_updated_at();

-- Налаштування RLS для всіх таблиць
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_reminders ENABLE ROW LEVEL SECURITY;

-- Політики RLS для таблиці users
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for service role" ON public.users
  FOR INSERT WITH CHECK (true);

-- Політики RLS для таблиці projects
CREATE POLICY "Users can view their own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);

-- Політики RLS для таблиці tasks
CREATE POLICY "Users can view their own tasks" ON public.tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON public.tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Політики RLS для інших таблиць (за потребою)
CREATE POLICY "Users can view all tags" ON public.tags
  FOR SELECT USING (true);

CREATE POLICY "Users can manage task_tags for their tasks" ON public.task_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE tasks.id = task_tags.task_id 
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own time_entries" ON public.time_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own time_entries" ON public.time_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time_entries" ON public.time_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own time_entries" ON public.time_entries
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own user_filters" ON public.user_filters
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own user_filters" ON public.user_filters
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own user_filters" ON public.user_filters
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own user_filters" ON public.user_filters
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own reminder_settings" ON public.reminder_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reminder_settings" ON public.reminder_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminder_settings" ON public.reminder_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own scheduled_reminders" ON public.scheduled_reminders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scheduled_reminders" ON public.scheduled_reminders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled_reminders" ON public.scheduled_reminders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled_reminders" ON public.scheduled_reminders
  FOR DELETE USING (auth.uid() = user_id); 