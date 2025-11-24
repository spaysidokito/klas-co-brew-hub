-- Delete all addons and re-insert clean data
DELETE FROM public.addons;

INSERT INTO public.addons (name, price) VALUES
  ('Nata', 10),
  ('Oreo', 15),
  ('Biscoff', 15),
  ('Espresso Shot', 20);

-- Verify
SELECT * FROM public.addons ORDER BY name;
