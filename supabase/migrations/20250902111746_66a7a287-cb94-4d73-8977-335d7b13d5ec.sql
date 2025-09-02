-- Fix RLS policies for customers table to allow public access
-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to view all customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public insert access for customers" ON public.customers;

-- Create new policies that allow public access
CREATE POLICY "Allow public read access for customers" 
ON public.customers 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access for customers" 
ON public.customers 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access for customers" 
ON public.customers 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete access for customers" 
ON public.customers 
FOR DELETE 
USING (true);