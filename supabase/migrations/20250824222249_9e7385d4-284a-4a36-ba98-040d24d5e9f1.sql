-- Security Fix Migration: Implement Role-Based Access Control and Security Hardening
-- Using correct app_role enum values: 'org_owner', 'admin', 'viewer'

-- 1. Fix Profile Access Control - Replace overly permissive profile policy
DROP POLICY IF EXISTS "Users can view all profiles in their organizations" ON public.profiles;

-- Add restrictive profile policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (id = auth.uid());

CREATE POLICY "Org owners can view profiles in their organizations" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.memberships m1
    WHERE m1.user_id = auth.uid() 
    AND m1.role = 'org_owner'
    AND m1.organization_id IN (
      SELECT m2.organization_id 
      FROM public.memberships m2 
      WHERE m2.user_id = profiles.id
    )
  )
);

-- 2. Create role-based financial data access policies
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Organization access" ON public.bank_accounts;
DROP POLICY IF EXISTS "Organization access" ON public.transactions;
DROP POLICY IF EXISTS "Organization access" ON public.balance_snapshots;
DROP POLICY IF EXISTS "Organization access" ON public.forecast_outputs;
DROP POLICY IF EXISTS "Organization access" ON public.forecast_runs;
DROP POLICY IF EXISTS "Organization access" ON public.forecast_models;

-- Bank Accounts - Role-based access (using available roles: org_owner, admin, viewer)
CREATE POLICY "Org owners and admins full access to bank accounts" 
ON public.bank_accounts 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.memberships 
    WHERE user_id = auth.uid() 
    AND organization_id = bank_accounts.organization_id 
    AND role IN ('org_owner', 'admin')
  )
);

CREATE POLICY "Viewers can read bank accounts summary" 
ON public.bank_accounts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.memberships 
    WHERE user_id = auth.uid() 
    AND organization_id = bank_accounts.organization_id 
    AND role = 'viewer'
  )
);

-- Transactions - Role-based access with viewer restrictions
CREATE POLICY "Org owners and admins full access to transactions" 
ON public.transactions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.memberships 
    WHERE user_id = auth.uid() 
    AND organization_id = transactions.organization_id 
    AND role IN ('org_owner', 'admin')
  )
);

-- Viewers cannot see individual transactions, only aggregated data through views
CREATE POLICY "Viewers cannot access individual transactions" 
ON public.transactions 
FOR SELECT 
USING (
  false -- Viewers cannot see individual transactions
);

-- Balance Snapshots - Only privileged users
CREATE POLICY "Privileged users can access balance snapshots" 
ON public.balance_snapshots 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.memberships 
    WHERE user_id = auth.uid() 
    AND organization_id = balance_snapshots.organization_id 
    AND role IN ('org_owner', 'admin')
  )
);

-- Forecast data - Only privileged users
CREATE POLICY "Privileged users can access forecast outputs" 
ON public.forecast_outputs 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.memberships 
    WHERE user_id = auth.uid() 
    AND organization_id = forecast_outputs.organization_id 
    AND role IN ('org_owner', 'admin')
  )
);

CREATE POLICY "Privileged users can access forecast runs" 
ON public.forecast_runs 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.memberships 
    WHERE user_id = auth.uid() 
    AND organization_id = forecast_runs.organization_id 
    AND role IN ('org_owner', 'admin')
  )
);

CREATE POLICY "Privileged users can access forecast models" 
ON public.forecast_models 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.memberships 
    WHERE user_id = auth.uid() 
    AND organization_id = forecast_models.organization_id 
    AND role IN ('org_owner', 'admin')
  )
);

-- 3. Fix Database Function Security - Add proper search_path
CREATE OR REPLACE FUNCTION public.user_has_org_access(org_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.memberships
    WHERE user_id = auth.uid()
    AND organization_id = org_id
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.add_owner_membership()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert membership for the creator as org_owner
  INSERT INTO public.memberships (user_id, organization_id, role)
  VALUES (auth.uid(), NEW.id, 'org_owner');
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 4. Create secure function for role checking
CREATE OR REPLACE FUNCTION public.get_user_role_in_org(org_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
  SELECT role::text FROM public.memberships 
  WHERE user_id = auth.uid() 
  AND organization_id = org_id 
  LIMIT 1;
$$;

-- 5. Enhanced audit logging - Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type text,
  event_details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    event_type,
    user_id,
    details,
    created_at
  ) VALUES (
    event_type,
    auth.uid(),
    event_details,
    now()
  );
END;
$$;

-- 6. Create view for viewers to access aggregated financial data only
CREATE OR REPLACE VIEW public.financial_summary AS
SELECT 
  ba.organization_id,
  ba.currency,
  COUNT(ba.id) as total_accounts,
  SUM(ba.current_balance) as total_balance,
  COUNT(t.id) as transaction_count,
  COALESCE(SUM(CASE WHEN t.amount > 0 THEN t.amount END), 0) as total_income,
  COALESCE(SUM(CASE WHEN t.amount < 0 THEN ABS(t.amount) END), 0) as total_expenses
FROM public.bank_accounts ba
LEFT JOIN public.transactions t ON ba.id = t.bank_account_id
WHERE EXISTS (
  SELECT 1 FROM public.memberships 
  WHERE user_id = auth.uid() 
  AND organization_id = ba.organization_id
)
GROUP BY ba.organization_id, ba.currency;