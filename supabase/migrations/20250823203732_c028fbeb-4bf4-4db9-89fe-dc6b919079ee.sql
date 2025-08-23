-- Fix critical security vulnerabilities

-- 1. Strengthen waitlist_signups security - ensure only org owners can view
DROP POLICY IF EXISTS "Only admins can view waitlist signups" ON public.waitlist_signups;

CREATE POLICY "Only org owners can view waitlist signups" 
ON public.waitlist_signups 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.memberships 
    WHERE user_id = auth.uid() 
    AND role = 'org_owner'::app_role
  )
);

-- 2. Make organization_id NOT NULL in critical tables to ensure proper RLS
-- First, set default organization for any existing records without one
UPDATE public.balance_snapshots 
SET organization_id = (SELECT id FROM public.organizations LIMIT 1) 
WHERE organization_id IS NULL;

UPDATE public.bank_accounts 
SET organization_id = (SELECT id FROM public.organizations LIMIT 1) 
WHERE organization_id IS NULL;

UPDATE public.bank_connections 
SET organization_id = (SELECT id FROM public.organizations LIMIT 1) 
WHERE organization_id IS NULL;

UPDATE public.categories 
SET organization_id = (SELECT id FROM public.organizations LIMIT 1) 
WHERE organization_id IS NULL;

UPDATE public.transactions 
SET organization_id = (SELECT id FROM public.organizations LIMIT 1) 
WHERE organization_id IS NULL;

UPDATE public.forecast_models 
SET organization_id = (SELECT id FROM public.organizations LIMIT 1) 
WHERE organization_id IS NULL;

UPDATE public.scenarios 
SET organization_id = (SELECT id FROM public.organizations LIMIT 1) 
WHERE organization_id IS NULL;

-- Now make organization_id NOT NULL
ALTER TABLE public.balance_snapshots ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE public.bank_accounts ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE public.bank_connections ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE public.categories ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE public.transactions ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE public.forecast_models ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE public.scenarios ALTER COLUMN organization_id SET NOT NULL;

-- 3. Add foreign key constraints for data integrity
ALTER TABLE public.balance_snapshots 
ADD CONSTRAINT fk_balance_snapshots_organization 
FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.bank_accounts 
ADD CONSTRAINT fk_bank_accounts_organization 
FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.bank_connections 
ADD CONSTRAINT fk_bank_connections_organization 
FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.categories 
ADD CONSTRAINT fk_categories_organization 
FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.transactions 
ADD CONSTRAINT fk_transactions_organization 
FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.forecast_models 
ADD CONSTRAINT fk_forecast_models_organization 
FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.scenarios 
ADD CONSTRAINT fk_scenarios_organization 
FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

-- 4. Add security audit function for tracking access
CREATE OR REPLACE FUNCTION public.log_waitlist_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log when someone accesses waitlist data
  INSERT INTO public.comments (
    entity_type,
    entity_id,
    text,
    author_id,
    organization_id
  ) VALUES (
    'audit_log',
    NEW.id,
    'Waitlist data accessed by user: ' || COALESCE(auth.uid()::text, 'anonymous'),
    auth.uid(),
    (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid() LIMIT 1)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for audit logging
CREATE TRIGGER waitlist_access_audit
  AFTER SELECT ON public.waitlist_signups
  FOR EACH ROW
  EXECUTE FUNCTION public.log_waitlist_access();

-- 5. Add rate limiting table for edge functions
CREATE TABLE public.rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL, -- IP address or user ID
  endpoint TEXT NOT NULL,
  requests_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on rate limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only system can manage rate limits
CREATE POLICY "System only rate limits" 
ON public.rate_limits 
FOR ALL 
USING (false);