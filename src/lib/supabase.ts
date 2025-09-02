import { supabase } from '@/integrations/supabase/client'

// Export the client for direct use
export { supabase }

// Database Types
export interface Product {
  id: string
  product_name: string
  cost_price: number
  selling_price: number
  lowest_selling_price: number
  discount_percent?: number
  photos?: string[]
  quantity?: number
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  customer_name: string
  customer_phone: string
  total_dues: number
  created_at: string
  updated_at: string
}

export interface KhataEntry {
  id: string
  customer_id: string
  date: string | null
  products_taken: any // JSON field from database
  amount_paid: number | null
  remaining_due: number | null
  bill_photo_url?: string | null
  created_at: string
}

// Database Operations
export const createProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const createCustomer = async (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'total_dues'>) => {
  const { data, error } = await supabase
    .from('customers')
    .insert([{ ...customer, total_dues: 0 }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const uploadProductPhoto = async (file: File, productId: string) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${productId}_${Date.now()}.${fileExt}`
  const filePath = `products/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('product-photos')
    .upload(filePath, file)

  if (uploadError) throw uploadError

  const { data } = supabase.storage
    .from('product-photos')
    .getPublicUrl(filePath)

  return data.publicUrl
}

export const updateProduct = async (id: string, updates: Partial<Product>) => {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const getProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const getCustomers = async () => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const updateCustomer = async (id: string, updates: Partial<Customer>) => {
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const deleteCustomer = async (id: string) => {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export const getKhataEntries = async () => {
  const { data, error } = await supabase
    .from('khata_entries')
    .select(`
      *,
      customers (
        customer_name,
        customer_phone
      )
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const getKhataEntriesByCustomer = async (customerId: string) => {
  const { data, error } = await supabase
    .from('khata_entries')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const createKhataEntry = async (entry: Omit<KhataEntry, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('khata_entries')
    .insert([entry])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const updateKhataEntry = async (id: string, updates: Partial<KhataEntry>) => {
  const { data, error } = await supabase
    .from('khata_entries')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const deleteKhataEntry = async (id: string) => {
  const { error } = await supabase
    .from('khata_entries')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}