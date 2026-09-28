-- supabase/seed.sql
  insert into public.commodities (name, category) values
    ('Tomatoes', 'Vegetable'), ('Cabbage', 'Vegetable'), ('Lettuce', 'Vegetable'),
    ('Carrots', 'Vegetable'), ('Potatoes', 'Vegetable'), ('Onions', 'Vegetable')
  on conflict (name) do nothing;