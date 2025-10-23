
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
  passwordHash: string; // Storing hashed password
  role: Role;
  status: UserStatus;
  profilePhotoUrl?: string;
}

export interface Event {
  id: string;
  name: string;
  year: number;
  imageUrl: string;
}

export interface Item {
  id: string;
  eventId: string;
  name: string;
  availableStockKg: number;
}

export interface Order {
  id: string;
  memberId: string;
  eventId: string;
  itemId: string;
  customerName: string;
  quantityKg: number;
  amountInr: number;
  paymentStatus: PaymentStatus;
  verified: boolean;
  dateTime: string;
  edited?: boolean;
}

export interface Expense {
  id: string;
  addedById: string; // Can be host or member
  eventId: string;
  name: string;
  amountInr: number;
  verified: boolean;
  dateTime: string;
}

export interface StoredFile {
  id: string;
  uploadedById: string; // Host ID
  name: string;
  type: string;
  url: string; // Base64 data URL
  uploadDate: string;
}

export interface Note {
  id: string;
  memberId: string;
  eventId: string;
  content: string;
  imageUrls?: string[];
  dateTime: string;
}