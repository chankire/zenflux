-- Enable Row Level Security on waitlist_signups table
ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public insert access for waitlist signups
-- This allows anyone to sign up for the waitlist, but no one can read or modify existing entries
CREATE POLICY "Allow public waitlist signups" 
ON public.waitlist_signups 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Create policy to allow authenticated users to view all waitlist signups
-- (assuming this is needed for admin purposes)
CREATE POLICY "Allow authenticated users to view waitlist signups" 
ON public.waitlist_signups 
FOR SELECT 
TO authenticated
USING (true);