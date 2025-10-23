
export enum Role {
  HOST = 'host',
  MEMBER = 'member',
}

export enum UserStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
}

export enum PaymentStatus {
  BAKI = 'Baki',
  CASH = 'Cash',
  ONLINE = 'Online',
}

// Updated User type for Supabase. It combines auth user and profile data.
export interface User {
  id: string; // From Supabase auth
  name: string; // From profiles table
  email: string; // From Supabase auth
  role: Role; // From profiles table
  status: UserStatus; // From profiles table
}

export interface Event {
  id: string;
  name: string;
  year: number;
  image_url: string; // Field name matches Supabase table
}

export interface Item {
  id: string;
  event_id: string; // Field name matches Supabase table
  name: string;
  available_stock_kg: number; // Field name matches Supabase table
}

export interface Order {
  id: string;
  member_id: string; // Field name matches Supabase table
  event_id: string; // Field name matches Supabase table
  item_id: string; // Field name matches Supabase table
  customer_name: string; // Field name matches Supabase table
  quantity_kg: number; // Field name matches Supabase table
  amount_inr: number; // Field name matches Supabase table
  payment_status: PaymentStatus; // Field name matches Supabase table
  verified: boolean;
  date_time: string; // Field name matches Supabase table
  edited?: boolean;
}

export interface Expense {
  id: string;
  added_by_id: string; // Field name matches Supabase table
  event_id: string; // Field name matches Supabase table
  name: string;
  amount_inr: number; // Field name matches Supabase table
  verified: boolean;
  date_time: string; // Field name matches Supabase table
}

export interface StoredFile {
  id: string;
  uploaded_by_id: string; // Field name matches Supabase table
  name: string;
  file_path: string; // We now store the path, not the content
  upload_date: string; // Field name matches Supabase table
}

export interface Note {
  id: string;
  member_id: string; // Field name matches Supabase table
  event_id: string; // Field name matches Supabase table
  content: string;
  image_urls?: string[]; // Field name matches Supabase table
  date_time: string; // Field name matches Supabase table
}
