-- Fix RLS policies for products table to allow public access
-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to view all products" ON public.products;
DROP POLICY IF EXISTS "Allow public insert access for products" ON public.products;

-- Create new policies that allow public access
CREATE POLICY "Allow public read access for products" 
ON public.products 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access for products" 
ON public.products 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access for products" 
ON public.products 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete access for products" 
ON public.products 
FOR DELETE 
USING (true);