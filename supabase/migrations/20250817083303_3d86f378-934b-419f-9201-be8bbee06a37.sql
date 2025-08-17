-- Fix the foreign key constraint on memberships table
-- The issue is that user_id in memberships needs to properly reference profiles.id

-- First, let's add the missing foreign key constraint properly
ALTER TABLE public.memberships 
DROP CONSTRAINT IF EXISTS memberships_user_id_fkey;

ALTER TABLE public.memberships 
ADD CONSTRAINT memberships_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;