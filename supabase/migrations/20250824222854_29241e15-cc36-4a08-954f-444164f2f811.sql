-- Fix Security Definer View Issue - Corrected Version
-- Replace the problematic view with a secure function-based approach

-- 1. Drop the problematic view
DROP VIEW IF EXISTS public.financial_summary;

-- 2. Create a secure function that provides aggregated financial data for viewers
-- This approach is safer than a SECURITY DEFINER view
CREATE OR REPLACE FUNCTION public.get_financial_summary_for_org(org_id uuid)
RETURNS TABLE (
  organization_id uuid,
  currency text,
  total_accounts bigint,
  total_balance numeric,
  transaction_count bigint,
  total_income numeric,
  total_expenses numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

-- 3. Update transaction policy - drop existing and create new one
DROP POLICY IF EXISTS "Viewers cannot access individual transactions" ON public.transactions;

-- Create a policy that allows only org_owners and admins to see individual transactions
CREATE POLICY "Role based transaction access" 
ON public.transactions 
FOR SELECT 
USING (
  -- Allow org_owners and admins full access to individual transactions
  EXISTS (
    SELECT 1 FROM public.memberships 
    WHERE user_id = auth.uid() 
    AND organization_id = transactions.organization_id 
    AND role IN ('org_owner', 'admin')
  )
  -- Viewers cannot directly query individual transactions
  -- They must use the get_financial_summary_for_org function for aggregated data
);

-- 4. Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.get_financial_summary_for_org(uuid) TO authenticated;

-- 5. Log this security fix
SELECT public.log_security_event(
  'security_definer_view_fixed',
  jsonb_build_object(
    'action', 'replaced_view_with_function',
    'view_name', 'financial_summary',
    'function_name', 'get_financial_summary_for_org'
  )
);