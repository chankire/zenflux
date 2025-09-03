-- Fix database functions to include secure search_path
-- This prevents potential security issues by ensuring functions operate in the correct schema

-- Update functions that are missing SET search_path TO 'public'
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

CREATE OR REPLACE FUNCTION public.get_user_role_in_org(org_id uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role::text FROM public.memberships 
  WHERE user_id = auth.uid() 
  AND organization_id = org_id 
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.get_financial_summary_for_org(org_id uuid)
 RETURNS TABLE(organization_id uuid, currency text, total_accounts bigint, total_balance numeric, transaction_count bigint, total_income numeric, total_expenses numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user has access to this organization
  IF NOT EXISTS (
    SELECT 1 FROM public.memberships 
    WHERE user_id = auth.uid() 
    AND organization_id = org_id
  ) THEN
    RAISE EXCEPTION 'Access denied to organization';
  END IF;
  
  -- For viewers, return only aggregated data
  -- For org_owners and admins, they can access detailed data through normal RLS policies
  RETURN QUERY
  SELECT 
    ba.organization_id,
    ba.currency,
    COUNT(ba.id)::bigint as total_accounts,
    COALESCE(SUM(ba.current_balance), 0) as total_balance,
    COUNT(t.id)::bigint as transaction_count,
    COALESCE(SUM(CASE WHEN t.amount > 0 THEN t.amount END), 0) as total_income,
    COALESCE(SUM(CASE WHEN t.amount < 0 THEN ABS(t.amount) END), 0) as total_expenses
  FROM public.bank_accounts ba
  LEFT JOIN public.transactions t ON ba.id = t.bank_account_id
  WHERE ba.organization_id = org_id
  GROUP BY ba.organization_id, ba.currency;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_org_slug(org_name text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    base_slug text;
    final_slug text;
    counter integer := 0;
BEGIN
    -- Generate base slug from organization name
    base_slug := lower(regexp_replace(trim(org_name), '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := trim(base_slug, '-');
    
    -- Ensure slug is not empty
    IF base_slug = '' OR base_slug IS NULL THEN
        base_slug := 'organization';
    END IF;
    
    final_slug := base_slug;
    
    -- Check for uniqueness and add counter if needed
    WHILE EXISTS (SELECT 1 FROM public.organizations WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$function$;

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