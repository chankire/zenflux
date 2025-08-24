-- Fix SQL syntax and add organization/KPI policies

-- Allow authenticated users to create organizations
CREATE POLICY "Users can create organizations"
ON public.organizations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to create their own membership (needed for owner insert)
CREATE POLICY "Users can create their own membership"
ON public.memberships
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Trigger to add creator as org_owner on organization insert
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

CREATE TRIGGER trg_add_owner_membership
AFTER INSERT ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.add_owner_membership();

-- Create KPIs table to store custom targets
CREATE TABLE public.kpis (
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
CREATE POLICY "Organization access"
ON public.kpis
FOR ALL
TO authenticated
USING (user_has_org_access(organization_id))
WITH CHECK (user_has_org_access(organization_id));

-- Timestamp trigger for KPIs
CREATE TRIGGER trg_kpis_updated_at
BEFORE UPDATE ON public.kpis
FOR EACH ROW 
EXECUTE FUNCTION public.update_updated_at_column();