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

-- Налаштування RLS (Row Level Security) для таблиці users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Політика: користувачі можуть читати та редагувати тільки свої дані
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Дозволити всім створювати користувачів (це буде робити тригер)
CREATE POLICY "Enable insert for service role" ON public.users
  FOR INSERT WITH CHECK (true); 