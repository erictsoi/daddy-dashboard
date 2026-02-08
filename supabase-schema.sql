-- Daddy Dashboard Supabase Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Children table
CREATE TABLE IF NOT EXISTS children (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT DEFAULT '👶',
  theme_color TEXT DEFAULT 'blue',
  dob DATE,
  google_email TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Year groups table
CREATE TABLE IF NOT EXISTS year_groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  year_group_id UUID REFERENCES year_groups(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  color TEXT DEFAULT 'bg-gray-100',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  video_url TEXT,
  duration_minutes INTEGER DEFAULT 30,
  outcomes JSONB DEFAULT '[]',
  completed BOOLEAN DEFAULT FALSE,
  time_spent_seconds INTEGER DEFAULT 0,
  deleted BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE year_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profiles" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profiles" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own children" ON children
  FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can manage own children" ON children
  FOR ALL USING (user_id IN (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can view own year groups" ON year_groups
  FOR SELECT USING (
    child_id IN (SELECT id FROM children WHERE user_id IN (SELECT id FROM profiles WHERE auth.uid() = id))
  );

CREATE POLICY "Users can manage own year groups" ON year_groups
  FOR ALL USING (
    child_id IN (SELECT id FROM children WHERE user_id IN (SELECT id FROM profiles WHERE auth.uid() = id))
  );

CREATE POLICY "Users can view own subjects" ON subjects
  FOR SELECT USING (
    year_group_id IN (SELECT id FROM year_groups WHERE child_id IN (SELECT id FROM children WHERE user_id IN (SELECT id FROM profiles WHERE auth.uid() = id)))
  );

CREATE POLICY "Users can manage own subjects" ON subjects
  FOR ALL USING (
    year_group_id IN (SELECT id FROM year_groups WHERE child_id IN (SELECT id FROM children WHERE user_id IN (SELECT id FROM profiles WHERE auth.uid() = id)))
  );

CREATE POLICY "Users can view own lessons" ON lessons
  FOR SELECT USING (
    subject_id IN (SELECT id FROM subjects WHERE year_group_id IN (SELECT id FROM year_groups WHERE child_id IN (SELECT id FROM children WHERE user_id IN (SELECT id FROM profiles WHERE auth.uid() = id))))
  );

CREATE POLICY "Users can manage own lessons" ON lessons
  FOR ALL USING (
    subject_id IN (SELECT id FROM subjects WHERE year_group_id IN (SELECT id FROM year_groups WHERE child_id IN (SELECT id FROM children WHERE user_id IN (SELECT id FROM profiles WHERE auth.uid() = id))))
  );

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_children_user_id ON children(user_id);
CREATE INDEX IF NOT EXISTS idx_year_groups_child_id ON year_groups(child_id);
CREATE INDEX IF NOT EXISTS idx_subjects_year_group_id ON subjects(year_group_id);
CREATE INDEX IF NOT EXISTS idx_lessons_subject_id ON lessons(subject_id);
CREATE INDEX IF NOT EXISTS idx_lessons_completed ON lessons(completed) WHERE deleted = FALSE;
