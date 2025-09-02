-- Fix storage policies for product-photos bucket to allow public access

-- Create policy to allow public uploads to product-photos bucket
CREATE POLICY "Allow public uploads to product-photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'product-photos');

-- Create policy to allow public access to view product-photos
CREATE POLICY "Allow public access to product-photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'product-photos');

-- Create policy to allow public updates to product-photos
CREATE POLICY "Allow public updates to product-photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'product-photos');

-- Create policy to allow public deletes from product-photos
CREATE POLICY "Allow public deletes from product-photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'product-photos');