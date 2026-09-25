insert into public.commodities (name, category, requires_cold_chain) values
  ('Cabbage', 'Vegetable', false),
  ('Tomato', 'Vegetable', false),
  ('Carrot', 'Vegetable', false),
  ('Lettuce', 'Vegetable', true)
on conflict (name) do nothing;
