-- Add INSERT policy for organizations and auto-membership trigger

-- 1) Allow authenticated users to insert organizations
CREATE POLICY IF NOT EXISTS "Users can create organizations"
ON public.organizations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 2) Allow users to create their own membership (needed for owner insert)
CREATE POLICY IF NOT EXISTS "Users can create their own membership"
ON public.memberships
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 3) Trigger to add creator as org_owner on organization insert
CREATE OR REPLACE FUNCTION public.add_owner_membership()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert membership for the creator as org_owner
  INSERT INTO public.memberships (user_id, organization_id, role)
  VALUES (auth.uid(), NEW.id, 'org_owner');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_add_owner_membership ON public.organizations;
CREATE TRIGGER trg_add_owner_membership
AFTER INSERT ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.add_owner_membership();

-- 4) Create KPIs table to store custom targets
CREATE TABLE IF NOT EXISTS public.kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  name TEXT NOT NULL,
  target NUMERIC NOT NULL DEFAULT 0,
  unit TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.kpis ENABLE ROW LEVEL SECURITY;

-- Access policy based on organization membership
CREATE POLICY IF NOT EXISTS "Organization access"
ON public.kpis
FOR ALL
TO authenticated
USING (user_has_org_access(organization_id))
WITH CHECK (user_has_org_access(organization_id));

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_kpis_updated_at ON public.kpis;
CREATE TRIGGER trg_kpis_updated_at
BEFORE UPDATE ON public.kpis
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();