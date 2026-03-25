-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beverages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tastings ENABLE ROW LEVEL SECURITY;

-- ============ Profiles Policies ============

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============ Beverages Policies ============

CREATE POLICY "Beverages are viewable by everyone"
  ON public.beverages FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert beverages"
  ON public.beverages FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update beverages"
  ON public.beverages FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============ Tastings Policies ============

-- Owner can see their own tastings
CREATE POLICY "Users can view own tastings"
  ON public.tastings FOR SELECT
  USING (auth.uid() = user_id);

-- Anyone can view a tasting by ID (for guest flow and public view)
-- Uses anon key which has role 'anon'
CREATE POLICY "Anyone can view tastings by id"
  ON public.tastings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create tastings"
  ON public.tastings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tastings"
  ON public.tastings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tastings"
  ON public.tastings FOR DELETE
  USING (auth.uid() = user_id);
