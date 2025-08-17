-- First, create the demo organization with a fixed ID
INSERT INTO public.organizations (id, name, slug, base_currency, created_at, updated_at)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000'::uuid,
  'Demo Organization',
  'demo-org',
  'USD',
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  base_currency = EXCLUDED.base_currency,
  updated_at = now();