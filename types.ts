
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

export interface User {
  id: string; 
  name: string; 
  email: string; 
  role: Role; 
  status: UserStatus;
}

export interface Event {
  id: string;
  name: string;
  year: number;
  image_url: string;
}

export interface Item {
  id: string;
  event_id: string;
  name: string;
  available_stock_kg: number;
}

export interface Order {
  id: string;
  member_id: string;
  event_id: string;
  item_id: string;
  customer_name: string;
  quantity_kg: number;
  amount_inr: number;
  payment_status: PaymentStatus;
  verified: boolean;
  date_time: string;
  edited?: boolean;
}

export interface Expense {
  id: string;
  added_by_id: string;
  event_id: string;
  name: string;
  amount_inr: number;
  verified: boolean;
  date_time: string;
}

export interface StoredFile {
  id: string;
  uploaded_by_id: string;
  name: string;
  file_path: string;
  upload_date: string;
}

export interface Note {
  id: string;
  member_id: string;
  event_id: string;
  content: string;
  image_urls?: string[];
  date_time: string;
}
