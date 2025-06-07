-- Enable RLS для всіх таблиць
alter default privileges revoke execute on functions from public;
alter default privileges in schema public revoke execute on functions from anon;

-- Створення таблиці users
create table if not exists public.users (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  name text not null,
  password text not null,
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
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
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
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
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
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references public.users(id) on delete cascade not null
);

-- Створення таблиці user_filters
create table if not exists public.user_filters (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  filters text not null, -- JSON string
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
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
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
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
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references public.users(id) on delete cascade not null,
  task_id uuid references public.tasks(id) on delete cascade
);

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
create trigger handle_updated_at before update on public.reminder_settings for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at before update on public.scheduled_reminders for each row execute procedure public.handle_updated_at(); 