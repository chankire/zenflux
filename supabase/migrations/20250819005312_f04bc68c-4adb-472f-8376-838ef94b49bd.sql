-- Remove the overly permissive policy that allows all authenticated users to view waitlist signups
DROP POLICY IF EXISTS "Allow authenticated users to view waitlist signups" ON public.waitlist_signups;

-- Create a more restrictive policy that only allows admin users to view waitlist signups
-- This prevents email harvesting by regular users while maintaining admin functionality
CREATE POLICY "Only admins can view waitlist signups" 
ON public.waitlist_signups 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.memberships 
    WHERE user_id = auth.uid() 
    AND role = 'org_owner'
  )
);