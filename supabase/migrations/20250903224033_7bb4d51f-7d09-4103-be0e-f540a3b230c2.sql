-- Fix organization creation RLS policy
-- The current policy prevents users from creating organizations because it checks
-- if they're NOT already an org_owner, but they need to create the org first to become one

DROP POLICY IF EXISTS "Secure organization creation" ON public.organizations;

-- Allow authenticated users to create organizations
-- The trigger will automatically make them the org_owner after creation
CREATE POLICY "Allow authenticated users to create organizations" 
ON public.organizations 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL AND
  created_by = auth.uid()
);

-- Also ensure the trigger exists to add owner membership
DROP TRIGGER IF EXISTS add_owner_membership_trigger ON public.organizations;

CREATE TRIGGER add_owner_membership_trigger
  AFTER INSERT ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.add_owner_membership();